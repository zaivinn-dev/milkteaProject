import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/admin/login', {
        username,
        password
      });

      if (response.status === 200) {
        const { user } = response.data;
        login(user.username, user.role);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tea to-teaLight flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <img 
            src="/images/BIG-brew.png" 
            alt="Logo" 
            className="w-20 h-20 mx-auto mb-4 rounded-lg object-contain drop-shadow-lg"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <h2 className="text-3xl font-bold text-tea mb-2">Admin Portal</h2>
          <p className="text-gray-600">Tea Station Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block font-bold text-tea mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-2 border-tea rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teaLight"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block font-bold text-tea mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-tea rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teaLight"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-tea to-teaLight hover:shadow-lg text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
