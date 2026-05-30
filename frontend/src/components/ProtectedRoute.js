import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AdminLogin from '../admin/pages/AdminLogin';
import StaffLogin from '../pages/StaffLogin';

export default function ProtectedRoute({
  component: Component,
  requireAdmin = false,
  kitchenOnly = false,
  title = 'Admin Portal',
  subtitle = 'Tea Station Management System'
}) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    if (kitchenOnly) {
      return <StaffLogin />;
    }
    return <AdminLogin title={title} subtitle={subtitle} />;
  }

  if (requireAdmin && user.role !== 'admin') {
    if (user.role === 'staff') {
      return <Navigate to="/kitchen" replace />;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
        <div className="card max-w-md p-8 text-center">
          <h1 className="font-display text-2xl font-semibold text-red-700">Access denied</h1>
          <p className="mt-2 text-tea-muted">Admin sign-in required.</p>
        </div>
      </div>
    );
  }

  if (kitchenOnly && user.role !== 'staff' && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 text-lg">Kitchen staff or admin access required.</p>
        </div>
      </div>
    );
  }

  return <Component />;
}
