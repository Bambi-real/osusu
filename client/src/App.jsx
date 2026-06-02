import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import Spinner             from './components/common/Spinner';
import TopProgressBar      from './components/common/TopProgressBar';

const LandingPage         = lazy(() => import('./pages/LandingPage'));
const LoginPage           = lazy(() => import('./pages/LoginPage'));
const RegisterPage        = lazy(() => import('./pages/RegisterPage'));
const DashboardPage       = lazy(() => import('./pages/DashboardPage'));
const CreateGroupPage     = lazy(() => import('./pages/CreateGroupPage'));
const GroupDetailPage     = lazy(() => import('./pages/GroupDetailPage'));
const ProfilePage         = lazy(() => import('./pages/ProfilePage'));
const MyContributionsPage = lazy(() => import('./pages/MyContributionsPage'));
const ForgotPasswordPage  = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage   = lazy(() => import('./pages/ResetPasswordPage'));
const NotFoundPage        = lazy(() => import('./pages/NotFoundPage'));

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner fullPage />;
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullPage />;
  if (user)    return <Navigate to="/dashboard" replace />;
  return children;
}

function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullPage />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
}

export default function App() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-green-700 focus:font-semibold focus:text-sm"
      >
        Skip to content
      </a>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#111827',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          },
          success: {
            icon: (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ),
          },
          error: {
            icon: (
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            ),
          },
        }}
      />
      <BrowserRouter>
        <TopProgressBar />
        <main id="main-content" tabIndex={-1}>
          <Suspense fallback={<Spinner fullPage />}>
            <Routes>
              <Route path="/"               element={<HomeRoute />} />
              <Route path="/login"          element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/register"       element={<PublicRoute><RegisterPage /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
              <Route path="/reset-password"  element={<ResetPasswordPage />} />
              <Route path="/dashboard"      element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/contributions"  element={<ProtectedRoute><MyContributionsPage /></ProtectedRoute>} />
              <Route path="/groups/new"     element={<ProtectedRoute><CreateGroupPage /></ProtectedRoute>} />
              <Route path="/groups/:id"     element={<ProtectedRoute><GroupDetailPage /></ProtectedRoute>} />
              <Route path="/profile"        element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="*"               element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
      </BrowserRouter>
    </>
  );
}
