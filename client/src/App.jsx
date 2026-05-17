import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import LandingPage     from './pages/LandingPage';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import DashboardPage   from './pages/DashboardPage';
import CreateGroupPage from './pages/CreateGroupPage';
import GroupDetailPage from './pages/GroupDetailPage';
import ProfilePage     from './pages/ProfilePage';
import MyContributionsPage from './pages/MyContributionsPage';
import Spinner         from './components/common/Spinner';
import LoadingSpinner  from './components/common/LoadingSpinner';
import NotFoundPage    from './pages/NotFoundPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullPage />;
  return user ? children : <Navigate to="/login" replace />;
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
        <Routes>
          <Route path="/"          element={<HomeRoute />} />
          <Route path="/login"     element={<LoginPage />} />
          <Route path="/register"  element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/contributions" element={<ProtectedRoute><MyContributionsPage /></ProtectedRoute>} />
          <Route path="/groups/new" element={<ProtectedRoute><CreateGroupPage /></ProtectedRoute>} />
          <Route path="/groups/:id" element={<ProtectedRoute><GroupDetailPage /></ProtectedRoute>} />
          <Route path="/profile"    element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
