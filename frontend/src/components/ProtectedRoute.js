import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminLogin from './AdminLogin';

export default function ProtectedRoute({ component: Component, requireAdmin = false }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">❌ Access Denied</h1>
          <p className="text-gray-600 text-lg">You don't have permission to access this page</p>
        </div>
      </div>
    );
  }

  return <Component />;
}
