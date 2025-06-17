import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import CompanyOwnerDashboard from './pages/companyowner/CompanyOwnerDashboard';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Indlæser...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!user ? <LoginPage /> : <Navigate to={getDefaultRoute(user.role)} replace />} 
      />
      
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/virksomhedsejer/*" element={
        <ProtectedRoute allowedRoles={['company_owner']}>
          <CompanyOwnerDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/medarbejder/*" element={
        <ProtectedRoute allowedRoles={['employee']}>
          <EmployeeDashboard />
        </ProtectedRoute>
      } />
      
      <Route 
        path="/" 
        element={
          user ? <Navigate to={getDefaultRoute(user.role)} replace /> : <Navigate to="/login" replace />
        } 
      />
      
      {/* Catch all route */}
      <Route 
        path="*" 
        element={
          user ? <Navigate to={getDefaultRoute(user.role)} replace /> : <Navigate to="/login" replace />
        } 
      />
    </Routes>
  );
}

function getDefaultRoute(role: string) {
  switch (role) {
    case 'admin': return '/admin';
    case 'company_owner': return '/virksomhedsejer';
    case 'employee': return '/medarbejder';
    default: return '/login';
  }
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;