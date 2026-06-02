import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPasswordPage() {
  const [email, setEmail]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    document.title = 'Reset Password — Osusu';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase()
      });
    } catch {
      // Intentionally swallow error
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 page-enter">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">

          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg aria-hidden="true" className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Check your email
          </h1>
          <p className="text-sm text-gray-500 mb-2">
            If an account exists for
          </p>
          <p className="text-sm font-semibold text-gray-900 mb-4">
            {email}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            we've sent a password reset link.
            Check your inbox and spam folder.
            The link expires in 1 hour.
          </p>

          <p className="text-sm text-gray-400 mb-5">
            Didn't receive it?{' '}
            <button
              onClick={() => setSubmitted(false)}
              className="text-green-600 font-medium hover:text-green-700 transition-colors">
              Try again
            </button>
          </p>

          <Link to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Sign In
          </Link>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 bg-green-600 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-600">
            <svg aria-hidden="true" viewBox="0 0 40 40" fill="none" className="w-7 h-7">
              <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="2.5"/>
              <circle cx="20" cy="6" r="3.5" fill="currentColor"/>
              <circle cx="34" cy="20" r="3.5" fill="currentColor"/>
              <circle cx="20" cy="34" r="3.5" fill="currentColor"/>
              <circle cx="6" cy="20" r="3.5" fill="currentColor"/>
              <path d="M20 6 A14 14 0 0 1 34 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-white font-bold text-xl">Osusu</span>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Happens to everyone.
          </h2>
          <p className="text-green-200 text-base">
            We'll send you a secure reset link so you
            can get back to your osusu groups.
          </p>
        </div>

        <p className="text-green-300 text-sm">
          Built for The Gambia 🇬🇲
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center text-white">
              <svg aria-hidden="true" viewBox="0 0 40 40" fill="none" className="w-5 h-5">
                <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="2.5"/>
                <circle cx="20" cy="6" r="3.5" fill="currentColor"/>
                <circle cx="34" cy="20" r="3.5" fill="currentColor"/>
                <circle cx="20" cy="34" r="3.5" fill="currentColor"/>
                <circle cx="6" cy="20" r="3.5" fill="currentColor"/>
                <path d="M20 6 A14 14 0 0 1 34 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900">Osusu</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">

            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Forgot your password?
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Enter the email address on your account.
              We'll send a secure reset link immediately.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your email"
                  autoFocus
                  autoComplete="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
                {error && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1" role="alert">
                    <span>⚠</span> {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-150 flex items-center justify-center gap-2">
                {loading && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                )}
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-green-600 font-medium hover:text-green-700 transition-colors">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
