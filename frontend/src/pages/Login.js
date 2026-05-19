import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', role: 'farmer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);

      // ── Diagnostic logs (safe to keep; useful for future debugging) ──────
      console.log('[Login] API RESPONSE:', res.data);

      // Persist the raw token for Authorization header use in other requests
      localStorage.setItem('token', res.data.token);

      // ── Extract user fields from the confirmed response shape ─────────────
      // Backend now returns: { token, user: { id, name, email, role } }
      // String() + toLowerCase() guards against null/undefined/mixed-case values.
      const rawRole = String(res.data.user?.role || '').toLowerCase() || 'buyer';
      const userData = {
        id:    res.data.user?.id    ?? null,
        name:  res.data.user?.name  || formData.email,
        email: res.data.user?.email || formData.email,
        role:  rawRole,
      };

      console.log('[Login] CONSTRUCTED USER:', userData);

      // Update global AuthContext state and persist to localStorage
      login(userData);

      // ── Role → destination map ────────────────────────────────────────────
      // { replace: true } removes /login from history so Back button skips it.
      const ROLE_ROUTES = {
        farmer: '/farmer',
        admin:  '/admin',
        buyer:  '/buyer',
      };
      const destination = ROLE_ROUTES[userData.role] ?? '/';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 via-white to-primary-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center px-4 transition-colors duration-300">
      <div className="max-w-md w-full">
        <div className="glass-card shadow-2xl border border-white/30 dark:bg-slate-800 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6 mb-4 text-white rounded-t-xl">
            <h2 className="text-xl font-display font-bold">FarmTrust Sign In</h2>
            <p className="text-sm opacity-90">Access your FarmTrust portal</p>
          </div>
          <div className="text-center mb-8">
            <img
              src="/main_logo.png"
              alt="FarmTrust logo"
              className="h-14 w-auto object-contain mx-auto mb-4"
            />
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-slate-100 mb-2">Welcome Back</h1>
            <p className="text-slate-600 dark:text-slate-400">Sign in to your FarmTrust account</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
              <p className="font-semibold mb-1">Error</p>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label dark:text-slate-300">Email address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                onChange={onChange}
                required
                className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
              />
            </div>

            <div className="form-group">
              <label className="form-label dark:text-slate-300">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                onChange={onChange}
                required
                className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
              />
            </div>

            <div className="form-group">
              <label className="form-label dark:text-slate-300">Sign in as</label>
              <select
                name="role"
                onChange={onChange}
                value={formData.role}
                className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              >
                <option value="farmer">Farmer</option>
                <option value="buyer">Buyer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mb-4 text-lg">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="divider mb-6"></div>

          <p className="text-center text-slate-600 dark:text-slate-400">
            Don't have an account? <Link to="/register" className="link-primary">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;