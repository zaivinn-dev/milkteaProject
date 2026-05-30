import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerRoute from './components/CustomerRoute';
import KitchenNavbar from './components/KitchenNavbar';
import OrderPreparation from './pages/OrderPreparation';
import AdminDashboard from './admin/pages/AdminDashboard';

function KitchenWorkspace() {
  return (
    <>
      <KitchenNavbar />
      <OrderPreparation />
    </>
  );
}

function KitchenPage() {
  return <ProtectedRoute component={KitchenWorkspace} kitchenOnly />;
}

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<CustomerRoute />} />
          <Route path="/kitchen" element={<KitchenPage />} />
          <Route
            path="/admin"
            element={<ProtectedRoute component={AdminDashboard} requireAdmin={true} />}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
