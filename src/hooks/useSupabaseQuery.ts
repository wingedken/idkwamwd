import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';

interface UseSupabaseQueryOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
}

export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  dependencies: any[] = [],
  options: UseSupabaseQueryOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { enabled = true, refetchOnMount = true } = options;

  const refetch = async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await queryFn();
      setData(result.data);
      setError(result.error);
    } catch (err) {
      setError(err as PostgrestError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (refetchOnMount) {
      refetch();
    }
  }, dependencies);

  return {
    data,
    error,
    isLoading,
    refetch,
  };
}

export function useSupabaseMutation<T, V>(
  mutationFn: (variables: V) => Promise<{ data: T | null; error: PostgrestError | null }>
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (variables: V) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await mutationFn(variables);
      setData(result.data);
      setError(result.error);
      return result;
    } catch (err) {
      const error = err as PostgrestError;
      setError(error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}