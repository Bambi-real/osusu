import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import api from '../api/axios';

export default function ResetPasswordPage() {
  const [password, setPassword]         = useState('');
  const [confirm, setConfirm]           = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [success, setSuccess]           = useState(false);
  const [error, setError]               = useState('');
  const [tokenState, setTokenState]     = useState('checking');
  const [accessToken, setAccessToken]   = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Set New Password — Osusu';
    let cancelled = false;

    // Listen for the PASSWORD_RECOVERY event that Supabase fires
    // when it detects and processes the recovery hash in the URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === 'PASSWORD_RECOVERY' && session?.access_token) {
        setAccessToken(session.access_token);
        setTokenState('valid');
        window.history.replaceState({}, '', '/reset-password');
      }
    });

    // Also check if Supabase already processed the hash and set the session
    // (the event may have fired before this component mounted)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session?.access_token) {
        setAccessToken(session.access_token);
        setTokenState('valid');
        window.history.replaceState({}, '', '/reset-password');
      }
    });

    // Timeout: if nothing matched after 5s, show invalid state
    const timer = setTimeout(() => {
      if (cancelled) return;
      setTokenState(current => current === 'checking' ? 'invalid' : current);
    }, 5000);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const getStrength = (pwd) => {
    let s = 0;
    if (pwd.length >= 8)            s++;
    if (pwd.length >= 12)           s++;
    if (/[0-9]/.test(pwd))          s++;
    if (/[A-Z]/.test(pwd))          s++;
    if (/[^a-zA-Z0-9]/.test(pwd))  s++;
    return s;
  };
  const strength = getStrength(password);
  const strengthMeta = [
    null,
    { label: 'Weak',        color: 'bg-red-400',    text: 'text-red-500'    },
    { label: 'Fair',        color: 'bg-amber-400',  text: 'text-amber-500'  },
    { label: 'Good',        color: 'bg-yellow-400', text: 'text-yellow-600' },
    { label: 'Strong',      color: 'bg-green-500',  text: 'text-green-600'  },
    { label: 'Very Strong', color: 'bg-green-600',  text: 'text-green-700'  },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', {
        newPassword: password,
        accessToken,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        'Failed to reset password. The link may have expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (tokenState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (tokenState === 'invalid') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Link expired or invalid
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            This password reset link has expired or has
            already been used. Reset links are valid for
            1 hour only.
          </p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all mb-3">
            Request a New Link
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors">
            ← Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Password updated!
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Your password has been changed successfully.
            You can now sign in with your new password.
          </p>
          <button
            onClick={() => navigate('/login?reason=password_reset')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all">
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center text-white">
            <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7">
              <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="2.5"/>
              <circle cx="20" cy="6" r="3.5" fill="currentColor"/>
              <circle cx="34" cy="20" r="3.5" fill="currentColor"/>
              <circle cx="20" cy="34" r="3.5" fill="currentColor"/>
              <circle cx="6" cy="20" r="3.5" fill="currentColor"/>
              <path d="M20 6 A14 14 0 0 1 34 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-xl">
            Osusu
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Set a new password
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Choose a strong password you haven't used before.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="At least 8 characters"
                  autoFocus
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium transition-colors">
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthMeta[strength]?.color : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strengthMeta[strength]?.text}`}>
                    {strengthMeta[strength]?.label}
                    {strength < 3 && ' — add numbers or symbols'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Repeat your new password"
                  className={`
                    w-full border rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 transition-colors
                    ${confirm.length > 0
                      ? password === confirm
                        ? 'border-green-400 focus:ring-green-500'
                        : 'border-red-400 focus:ring-red-400'
                      : 'border-gray-300 focus:ring-green-500'
                    }
                  `}
                />
                {confirm.length > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                    {password === confirm ? '✅' : '❌'}
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center gap-1.5">
                  <span>⚠</span> {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password || !confirm || password !== confirm || password.length < 8}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-150 flex items-center justify-center gap-2">
              {loading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              )}
              {loading ? 'Updating...' : 'Update Password'}
            </button>

          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-1 hover:text-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Sign In
          </button>
        </p>

      </div>
    </div>
  );
}
