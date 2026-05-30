import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function StaffLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'staff') {
      navigate('/kitchen', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/staff/login', { username, password });

      if (response.status === 200) {
        const { user, token } = response.data;
        login(user.username, user.role, token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-800 via-tea-dark to-tea px-4 py-12">
      <div className="auth-card">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-milk shadow-soft">
            <img
              src="/images/BIG-brew.png"
              alt="BigBrew"
              className="h-14 w-14 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <h2 className="font-display text-2xl font-semibold text-tea">Kitchen</h2>
          <p className="mt-1 text-sm text-tea-muted">Staff sign-in for order preparation</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-tea">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="Kitchen username"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-tea">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-50">
            {loading ? 'Signing in…' : 'Enter kitchen'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-tea-muted">
          Admin accounts use the admin portal. Contact your manager for staff credentials.
        </p>
      </div>
    </div>
  );
}
