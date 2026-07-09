import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    document.title = 'Verify Email — Osusu';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
        <p className="text-gray-500 mb-2">We sent a verification link to:</p>
        <p className="font-semibold text-gray-900 mb-6">{email}</p>
        <p className="text-gray-500 text-sm mb-8">
          Click the link in the email to verify your account before logging in.
        </p>

        {resent && (
          <p className="text-green-600 text-sm mb-4">Verification email resent!</p>
        )}

        <Link
          to="/login"
          className="w-full inline-flex justify-center items-center py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Go to Login
        </Link>

        <p className="text-gray-400 text-xs mt-6">
          Didn't receive the email? Check your spam folder.
        </p>
      </div>
    </div>
  );
}