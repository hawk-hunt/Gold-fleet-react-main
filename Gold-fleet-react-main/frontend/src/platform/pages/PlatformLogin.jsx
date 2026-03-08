import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import platformApi from '../services/platformApi';

/**
 * Platform Login Page
 * Independent login for Platform Owner
 * Stores token in platformToken (NOT authToken)
 */
export default function PlatformLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await platformApi.login(email, password);
      // Token is already stored by platformApi.login()
      navigate('/platform/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: 'url(/images/maxresdefault-3490897627.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        // do not fix attachment so the image disappears when this component unmounts
        // (fixed backgrounds can linger under other pages due to viewport anchoring)
      }}
    >
      {/* Light overlay for readability; only 30% so the image shows through */}
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="w-full max-w-md relative z-10">
        {/* Logo Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 border-2 border-yellow-600 mb-4">
            <span className="text-2xl font-bold text-yellow-600">PO</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Gold Fleet</h1>
          <p className="text-slate-400">Platform Owner Portal</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-yellow-600 rounded-lg shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Platform Login</h2>

          {error && (
            <div className="mb-4 p-4 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <FaEnvelope className="inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="platform@gold-fleet.com"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <FaLock className="inline mr-2" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login to Platform'}
            </button>
          </form>

          {/* Info Text */}
          <div className="mt-6 p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg">
            <p className="text-xs text-slate-400">
              Demo: Use your platform owner credentials to access the SaaS management panel.
            </p>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link to="/platform/signup" className="text-gray-400 hover:text-gray-300 font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-slate-600/50"></div>
            <span className="px-2 text-slate-400 text-sm">OR</span>
            <div className="flex-grow h-px bg-slate-600/50"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center border border-slate-600/50 py-3 rounded-lg hover:bg-slate-700/30 transition-colors text-white">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Login with Google
            </button>

            <button className="w-full flex items-center justify-center border border-slate-600/50 py-3 rounded-lg hover:bg-slate-700/30 transition-colors text-white">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="mr-2 w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M493.4 24.6l-104-24c-11.3-2.6-22.9 3.3-27.5 13.9l-48 112c-4.2 9.8-1.4 21.3 6.9 28l60.6 49.6c-36 76.7-98.9 140.5-177.2 177.2l-49.6-60.6c-6.8-8.3-18.2-11.1-28-6.9l-112 48C3.9 366.5-2 378.1.6 389.4l24 104C27.1 504.2 36.7 512 48 512c256.1 0 464-207.5 464-464 0-11.2-7.7-20.9-18.6-23.4z"></path>
              </svg>
              Login with SMS
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-500 text-sm">
          <p>This is a separate login for platform administrators only.</p>
        </div>
      </div>
    </div>
  );
}

