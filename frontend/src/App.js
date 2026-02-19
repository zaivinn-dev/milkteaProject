import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import OrderMenu from './pages/OrderMenu';
import OrderPreparation from './pages/OrderPreparation';
import AdminDashboard from './admin/pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<><Navbar /><OrderMenu /></>} />
          <Route path="/kitchen" element={<><Navbar /><OrderPreparation /></>} />

          {/* Admin Routes */}
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
