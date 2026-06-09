import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminNavLinks = [
  { to: '/admin',         label: 'Overview',  exact: true  },
  { to: '/admin/users',   label: 'Users',     exact: false },
  { to: '/admin/groups',  label: 'Groups',    exact: false },
];

export default function AdminLayout({ children }) {
  const location  = useLocation();
  const { user } = useAuth();

  const isActive = (to, exact) => exact
    ? location.pathname === to
    : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-gray-50">

      <header className="bg-gray-900 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            <div className="flex items-center gap-3">
              <Link to="/admin" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-sm">O</span>
                </div>
                <span className="font-bold text-white text-sm">Osusu</span>
              </Link>
              <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
                Admin
              </span>
            </div>

            <nav className="flex items-center gap-1">
              {adminNavLinks.map(({ to, label, exact }) => (
                <Link
                  key={to}
                  to={to}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive(to, exact)
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Exit Admin
              </Link>
              <span className="text-xs text-gray-500">
                {user?.fullName?.split(' ')[0]}
              </span>
            </div>

          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

    </div>
  );
}
