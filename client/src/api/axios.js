import axios from 'axios';
import axiosRetry from 'axios-retry';
import { supabase } from '../lib/supabase';

const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error(
    'Missing VITE_API_URL environment variable.'
  );
}

const api = axios.create({ baseURL: apiUrl, timeout: 15000 });

// Automatic retry with exponential backoff for transient failures
axiosRetry(api, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.code === 'ECONNABORTED' ||
      error.response?.status === 429 ||
      error.response?.status >= 500
    );
  },
  onRetry: (retryCount, error, requestConfig) => {
    if (import.meta.env.DEV) {
      console.warn(`[API] Retry ${retryCount}/2 for ${requestConfig.url}:`, error.message);
    }
  },
});

api.interceptors.request.use(
  async (config) => {
    const publicEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
    ];
    const isPublic = publicEndpoints.some(
      ep => config.url?.includes(ep)
    );

    if (!isPublic) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const publicPaths = [
      '/', '/login', '/register',
      '/forgot-password', '/reset-password'
    ];
    const isOnPublicPage = publicPaths.includes(window.location.pathname);

    if (!error.response) {
      const isBrowserOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      error.userMessage = isBrowserOffline
        ? 'You appear to be offline. Please check your internet connection.'
        : 'Request timed out or network error. Please try again.';
    }

    if (error.response?.status === 401 && !isOnPublicPage) {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        await supabase.auth.signOut();
        window.location.href = '/login?reason=session_expired';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Helper to create a request with a custom timeout
api.withTimeout = (timeoutMs) => {
  const instance = axios.create({
    baseURL: apiUrl,
    timeout: timeoutMs,
  });
  instance.interceptors.request.use(api.interceptors.request.handlers[0].fulfilled);
  instance.interceptors.response.use(
    api.interceptors.response.handlers[0].fulfilled,
    api.interceptors.response.handlers[0].rejected
  );
  return instance;
};

export default api;
