import React, { ReactNode } from 'react';
import { LogOut, User, Bell, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
  title: string;
  sidebar?: ReactNode;
}

export default function Layout({ children, title, sidebar }: LayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'company_owner': return 'Virksomhedsejer';
      case 'employee': return 'Medarbejder';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'company_owner': return 'bg-blue-500';
      case 'employee': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-white border-b border-gray-200 fixed w-full top-0 z-50 shadow-sm">
        <div className="px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side */}
            <div className="flex items-center">
              {sidebar && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden mr-3"
                >
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              )}
              
              <div className="flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5" />
              </button>

              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-50">
                <div className={`h-2 w-2 rounded-full ${getRoleColor(user?.role || '')}`}></div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user?.name}</div>
                  <div className="text-gray-500 text-xs">{getRoleDisplayName(user?.role || '')}</div>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Professional Sidebar */}
        {sidebar && (
          <>
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-40 lg:hidden">
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50" onClick={() => setSidebarOpen(false)} />
                <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    >
                      <X className="h-6 w-6 text-white" />
                    </button>
                  </div>
                  {sidebar}
                </div>
              </div>
            )}

            {/* Desktop sidebar */}
            <div className="hidden lg:flex lg:flex-shrink-0">
              <div className="flex flex-col w-64 bg-white border-r border-gray-200">
                {sidebar}
              </div>
            </div>
          </>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-8">
              <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}