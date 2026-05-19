import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFoundPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Page Not Found — OsusuApp';
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-50">
      <p className="text-8xl font-black text-green-100 select-none mb-2">
        404
      </p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Page not found
      </h1>
      <p className="text-gray-500 mb-8 max-w-sm text-sm">
        This page doesn't exist or you don't have permission to view it.
      </p>
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => navigate(user ? '/dashboard' : '/')}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition-all">
          {user ? 'Go to Dashboard' : 'Go to Home'}
        </button>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Go back
        </button>
      </div>
    </div>
  );
}
