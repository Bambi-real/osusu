import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setLoggedInUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    document.title = 'Create Account — OsusuApp';
  }, []);

  const clearError = (field) => {
    setFieldErrors(prev => ({ ...prev, [field]: null }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    const fullPhone = '+220' + phone;

    if (!/^\+220[0-9]{7}$/.test(fullPhone)) {
      setFieldErrors({ phone: 'Phone must be 7 digits (after +220)' });
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/register', {
        fullName,
        email,
        phone: fullPhone,
        password,
      });
      const { token, refreshToken, user } = res.data.data;

      await supabase.auth.setSession({ access_token: token, refresh_token: refreshToken });
      setLoggedInUser(user);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Registration failed. Please try again.';
      setError(msg);
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
            "Start saving<br />
            with your people."
          </h2>
          <p className="text-green-200 text-lg">
            Create an account in seconds. No credit card, no app download.
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

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create an account</h1>
          <p className="text-gray-500 mb-8">Let's get you set up to join a group.</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              name="fullName"
              type="text"
              required
              placeholder="Aisha Bojang"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); clearError('fullName'); }}
              error={fieldErrors.fullName}
            />
            <Input
              label="Email address"
              name="email"
              type="email"
              required
              placeholder="aisha@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
              error={fieldErrors.email}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition-colors">
                <span className="inline-flex items-center px-3 bg-gray-50 text-gray-500 text-sm font-medium border-r border-gray-300">
                  +220
                </span>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="3XXXXXX"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); clearError('phone'); }}
                  className="flex-1 block w-full px-3 py-2.5 text-sm border-none focus:ring-0 text-gray-900"
                />
              </div>
              {fieldErrors.phone && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <span>⚠</span> {fieldErrors.phone}
                </p>
              )}
            </div>

            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                error={fieldErrors.password}
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

            <div className="relative">
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); clearError('confirmPassword'); }}
                error={fieldErrors.confirmPassword}
              />
            </div>

            {error && <p className="text-xs text-red-600 flex items-center gap-1"><span>⚠</span> {error}</p>}

            <Button type="submit" loading={loading} className="w-full">
              Register
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link to="/login" className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Log in to your account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
