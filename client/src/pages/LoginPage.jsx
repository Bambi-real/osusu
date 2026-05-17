import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setLoggedInUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { email, password } = e.target.elements;
    try {
      const res = await api.post('/auth/login', { 
        email: email.value, 
        password: password.value 
      });
      const { token, refreshToken, user } = res.data.data;
      
      await supabase.auth.setSession({ access_token: token, refresh_token: refreshToken });
      setLoggedInUser(user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-6">
             <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">O</span>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Welcome back</h2>
          <p className="text-gray-500 mt-2">Please enter your details to sign in.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input label="Email address" name="email" type="email" required placeholder="Enter your email" />
          
          <div className="relative">
            <Input 
              label="Password" 
              name="password" 
              type={showPassword ? "text" : "password"} 
              required 
              placeholder="••••••••"
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
          
          {error && <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg border border-red-200">{error}</div>}
          
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
  );
}
