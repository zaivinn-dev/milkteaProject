import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from './Navbar';
import OrderMenu from '../pages/OrderMenu';

/**
 * Customer ordering — not available to kitchen staff (they use /kitchen only).
 */
export default function CustomerRoute() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-milk border-t-tea" />
      </div>
    );
  }

  if (user?.role === 'staff') {
    return <Navigate to="/kitchen" replace />;
  }

  return (
    <>
      <Navbar />
      <OrderMenu />
    </>
  );
}
