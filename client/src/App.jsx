import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import VerifyEmailPage from './pages/VerifyEmailPage';

import LandingPage         from './pages/LandingPage';
import LoginPage           from './pages/LoginPage';
import RegisterPage        from './pages/RegisterPage';
import DashboardPage       from './pages/DashboardPage';
import CreateGroupPage     from './pages/CreateGroupPage';
import GroupDetailPage     from './pages/GroupDetailPage';
import ProfilePage         from './pages/ProfilePage';
import MyContributionsPage from './pages/MyContributionsPage';
import ForgotPasswordPage  from './pages/ForgotPasswordPage';
import ResetPasswordPage   from './pages/ResetPasswordPage';
import Spinner             from './components/common/Spinner';
import LoadingSpinner      from './components/common/LoadingSpinner';
import NotFoundPage        from './pages/NotFoundPage';
import TopProgressBar      from './components/common/TopProgressBar';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullPage />;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullPage />;
  if (user)    return <Navigate to="/dashboard" replace />;
  return children;
}

function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullPage />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
}

export default function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <TopProgressBar />
        <Routes>
          <Route path="/"               element={<HomeRoute />} />
          <Route path="/login"          element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
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
      </BrowserRouter>
    </>
  );
}
