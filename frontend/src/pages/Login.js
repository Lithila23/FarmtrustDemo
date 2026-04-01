import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      window.location.href = '/buyer';
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 via-white to-primary-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="glass-card shadow-2xl border border-white/30 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6 mb-4 text-white rounded-t-xl">
            <h2 className="text-xl font-display font-bold">Farmer & Buyer Login</h2>
            <p className="text-sm opacity-90">Access your FarmTrust portal</p>
          </div>
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">FT</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-slate-600">Sign in to your FarmTrust account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              <p className="font-semibold mb-1">Error</p>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                onChange={onChange}
                required
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                onChange={onChange}
                required
                className="input-field"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mb-4 text-lg">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="divider mb-6"></div>

          <p className="text-center text-slate-600">
            Don't have an account? <Link to="/register" className="link-primary">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;