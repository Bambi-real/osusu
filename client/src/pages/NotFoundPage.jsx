import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFoundPage() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-indigo-600">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Page not found</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          This page doesn't exist or you don't have access to it.
        </p>
        <Link 
          to={user ? "/dashboard" : "/"} 
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {user ? "Go to Dashboard" : "Go Home"}
        </Link>
      </div>
    </div>
  );
}
