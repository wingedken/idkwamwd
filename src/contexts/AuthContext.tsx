import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'company_owner' | 'employee';
  companyId?: string;
  companyName?: string;
  phone?: string;
  isActive: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  signUp: (userData: {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'company_owner' | 'employee';
    companyId?: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  createCompanyOwner: (userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    companyName: string;
    companyData: {
      cvr?: string;
      address?: string;
      postalCode?: string;
      city?: string;
      phone?: string;
    };
  }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            // Clear invalid session data
            await logout();
            setInitialized(true);
          }
          return;
        }

        if (session?.user && mounted) {
          await fetchUserProfile(session.user);
        } else if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
        
        if (mounted) {
          setInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          // Clear invalid session data
          await logout();
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted || !initialized) return;

      console.log('Auth state change:', event, session?.user?.email);

      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setIsLoading(false);
      } else if (session?.user) {
        await fetchUserProfile(session.user);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select(`
          *,
          companies (
            name
          )
        `)
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        // Clear invalid session data when profile fetch fails
        await logout();
        return;
      }

      if (userProfile) {
        setUser({
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
          role: userProfile.role,
          companyId: userProfile.company_id,
          companyName: userProfile.companies?.name,
          phone: userProfile.phone,
          isActive: userProfile.is_active,
        });

        // Update last login
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', supabaseUser.id);
      } else {
        // Clear invalid session data when no profile is found
        await logout();
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Clear invalid session data on any error
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // fetchUserProfile will be called by the auth state change listener
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'Login fejlede' };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'Login fejlede' };
    }
  };

  const signUp = async (userData: {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'company_owner' | 'employee';
    companyId?: string;
    phone?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Brugeroprettelse fejlede' };
      }

      // Then create the user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          company_id: userData.companyId || null,
          phone: userData.phone || null,
          is_active: true,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return { success: false, error: 'Profil oprettelse fejlede: ' + profileError.message };
      }

      return { success: true };
    } catch (error) {
      console.error('SignUp error:', error);
      return { success: false, error: 'Brugeroprettelse fejlede' };
    }
  };

  const createCompanyOwner = async (userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    companyName: string;
    companyData: {
      cvr?: string;
      address?: string;
      postalCode?: string;
      city?: string;
      phone?: string;
    };
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Brugeroprettelse fejlede' };
      }

      // Use the database function to create company and user profile
      const { data: result, error: functionError } = await supabase.rpc('create_company_owner', {
        p_user_id: authData.user.id,
        p_email: userData.email,
        p_name: userData.name,
        p_phone: userData.phone || null,
        p_company_name: userData.companyName,
        p_company_cvr: userData.companyData.cvr || null,
        p_company_address: userData.companyData.address || null,
        p_company_postal_code: userData.companyData.postalCode || null,
        p_company_city: userData.companyData.city || null,
        p_company_phone: userData.companyData.phone || null,
      });

      if (functionError) {
        console.error('Function error:', functionError);
        return { success: false, error: 'Virksomhedsoprettelse fejlede: ' + functionError.message };
      }

      if (!result?.success) {
        return { success: false, error: result?.error || 'Virksomhedsoprettelse fejlede' };
      }

      return { success: true };
    } catch (error) {
      console.error('CreateCompanyOwner error:', error);
      return { success: false, error: 'Virksomhedsoprettelse fejlede' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, signUp, createCompanyOwner }}>
      {children}
    </AuthContext.Provider>
  );
}