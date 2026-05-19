import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setLoggedInUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  useEffect(() => {
    document.title = 'Sign In — OsusuApp';
  }, []);

  const reason = searchParams.get('reason');

  const sessionMessages = {
    session_expired: {
      icon: '⏱',
      text: 'Your session expired. Please sign in again.',
      style: 'bg-amber-50 border-amber-200 text-amber-700',
    },
    signed_out: {
      icon: '👋',
      text: 'You have been signed out.',
      style: 'bg-blue-50 border-blue-200 text-blue-700',
    },
    password_reset: {
      icon: '✅',
      text: 'Password updated. Please sign in with your new password.',
      style: 'bg-green-50 border-green-200 text-green-700',
    },
  };

  const clearErrors = () => {
    setEmailError(null);
    setPasswordError(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { 
        email, 
        password 
      });
      const { access_token, refresh_token, user } = res.data.data;
      
      await supabase.auth.setSession({ access_token, refresh_token });
      setLoggedInUser(user);
      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.error?.message;
      if (status === 401) {
        setError('Incorrect email or password. Please try again.');
      } else if (status === 429) {
        setError('Too many sign-in attempts. Please wait 15 minutes.');
      } else if (status === 0 || !err.response) {
        setError('No internet connection. Check your network and retry.');
      } else if (status >= 500) {
        setError('Server error. Please try again in a few moments.');
      } else {
        setError(msg || 'Sign in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 bg-green-600 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-green-600 font-black text-lg">O</span>
          </div>
          <span className="text-white font-bold text-xl">OsusuApp</span>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            "Saving together,<br />
            the smart way."
          </h2>
          <p className="text-green-200 text-lg">
            Join thousands of Gambians managing their osusu groups digitally.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {['A', 'F', 'M', 'K'].map((letter, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-green-400 border-2 border-green-600 flex items-center justify-center text-xs font-bold text-white">
                {letter}
              </div>
            ))}
          </div>
          <p className="text-green-200 text-sm">Built for The Gambia 🇬🇲</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black">O</span>
            </div>
            <span className="font-bold text-gray-900">OsusuApp</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-500 mb-8">Sign in to your account to continue.</p>

          {reason && sessionMessages[reason] && (
            <div className={`mb-4 p-3 rounded-lg border flex items-center gap-2 text-sm ${sessionMessages[reason].style}`}>
              <span>{sessionMessages[reason].icon}</span>
              <span>{sessionMessages[reason].text}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(null); clearErrors(); }}
              error={emailError}
            />
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-green-600 hover:text-green-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(null); clearErrors(); }}
                  className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${passwordError ? 'border-red-400' : 'border-gray-300'}`}
                />
              <button
                type="button"
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
            </div>
            
            {error && <p className="text-xs text-red-600 flex items-center gap-1"><span>⚠</span> {error}</p>}
            
            <Button type="submit" loading={loading} className="w-full">
              Sign in
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link to="/register" className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
