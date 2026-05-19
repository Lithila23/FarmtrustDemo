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
    <div className="min-h-screen bg-gradient-to-br from-primary-100 via-white to-primary-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center px-4 transition-colors duration-300">
      <div className="max-w-md w-full -mt-20">
        <div className="bg-white/75 backdrop-blur-md shadow-2xl rounded-2xl border border-white/30 dark:bg-slate-800 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 mb-4 text-white">
            <h2 className="text-lg font-display font-bold">Farmer & Buyer Login</h2>
            <p className="text-xs opacity-90">Access your FarmTrust portal</p>
          </div>
          
          <div className="px-6 pb-6">
            <div className="text-center mb-4">
              <img
                src="/main_logo.png"
                alt="FarmTrust logo"
                className="h-10 w-auto object-contain mx-auto mb-2"
              />
              <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 mb-1">Welcome Back</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Sign in to your FarmTrust account</p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg mb-4 text-xs">
                <p className="font-semibold">Error: {error}</p>
              </div>
            )}

            <form onSubmit={onSubmit}>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  onChange={onChange}
                  required
                  className="input-field py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  onChange={onChange}
                  required
                  className="input-field py-2 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mb-3 text-base">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">Or continue with</span>
              </div>
            </div>

            <button 
              type="button" 
              className="w-full flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors mb-4 font-medium"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Don't have an account? <Link to="/register" className="link-primary">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;