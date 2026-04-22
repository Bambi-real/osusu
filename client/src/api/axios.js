import axios from 'axios';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.error?.message || error.response?.data?.error || 'An unexpected error occurred';
    toast.error(typeof msg === 'string' ? msg : 'An unexpected error occurred', { duration: 4000, position: 'top-right' });
    return Promise.reject(error);
  }
);

export default api;
