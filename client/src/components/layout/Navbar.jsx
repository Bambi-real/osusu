import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const { user, logout }          = useAuth();
  const location                  = useLocation();
  const navigate                  = useNavigate();
  const menuRef                   = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('touchstart', handleClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const linkClass = (path) => `
    flex items-center px-3 py-2 rounded-lg text-sm
    font-medium transition-colors duration-150 min-h-[44px]
    ${isActive(path)
      ? 'bg-green-50 text-green-700'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }
  `;

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className={`
        sticky top-0 z-50 bg-white border-b border-gray-200
        transition-shadow duration-200
        ${scrolled ? 'shadow-sm' : ''}
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            <Link to={user ? '/dashboard' : '/'}
                  className="flex items-center gap-2
                             min-h-0 flex-shrink-0">
              <div className="w-8 h-8 bg-green-600 rounded-xl
                              flex items-center justify-center
                              flex-shrink-0">
                <span className="text-white font-black text-base">
                  O
                </span>
              </div>
              <span className="font-bold text-gray-900 text-lg">
                Osusu
              </span>
            </Link>

            {user && (
              <nav className="hidden md:flex items-center gap-1">
                <Link to="/dashboard" className={linkClass('/dashboard')}>
                  Dashboard
                </Link>
                <Link to="/contributions" className={linkClass('/contributions')}>
                  My History
                </Link>
                {user.role === 'SUPER_ADMIN' && (
                  <Link to="/admin" className={linkClass('/admin')}>
                    Admin
                  </Link>
                )}
              </nav>
            )}

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Link to="/groups/new"
                        className="
                          inline-flex items-center gap-1.5
                          bg-green-600 hover:bg-green-700
                          text-white font-semibold text-sm
                          px-4 py-2 rounded-full
                          transition-all duration-150
                        ">
                    <svg className="w-4 h-4" fill="none"
                         stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M12 4v16m8-8H4" />
                    </svg>
                    New Group
                  </Link>
                  <button onClick={() => navigate('/profile')}
                          className="
                            flex items-center gap-2
                            hover:opacity-80 transition-opacity
                            min-h-0
                          ">
                    <div className="w-8 h-8 bg-green-600 rounded-full
                                    flex items-center justify-center
                                    text-white text-sm font-bold
                                    flex-shrink-0">
                      {user.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user.fullName?.split(' ')[0]}
                    </span>
                  </button>
                  <button onClick={handleLogout}
                          className="text-gray-400 hover:text-gray-600
                                     transition-colors min-h-0 p-1">
                    <svg className="w-5 h-5" fill="none"
                         stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login"
                        className="text-sm font-medium text-gray-600
                                   hover:text-gray-900 px-3 py-2
                                   rounded-lg hover:bg-gray-100
                                   transition-colors">
                    Login
                  </Link>
                  <Link to="/register"
                        className="bg-green-600 hover:bg-green-700
                                   text-white font-semibold text-sm
                                   px-4 py-2 rounded-full
                                   transition-all">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            <div className="flex md:hidden items-center gap-2">
              {user && (
                <div className="w-8 h-8 bg-green-600 rounded-full
                                flex items-center justify-center
                                text-white text-sm font-bold">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="
                  w-10 h-10 flex items-center justify-center
                  rounded-lg text-gray-600 hover:text-gray-900
                  hover:bg-gray-100 transition-colors
                "
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              >
                {menuOpen ? (
                  <svg className="w-5 h-5" fill="none"
                       stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none"
                       stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40
                          backdrop-blur-sm"
               onClick={() => setMenuOpen(false)} />

          <div ref={menuRef}
               className="
                 absolute right-0 top-0 bottom-0 w-72
                 bg-white shadow-2xl
                 flex flex-col
                 animate-slide-in-right
               ">

            <div className="flex items-center justify-between
                            p-4 border-b border-gray-100">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600
                                  rounded-full flex items-center
                                  justify-center text-white
                                  font-bold">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold
                                  text-gray-900">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {user.role?.toLowerCase()}
                    </p>
                  </div>
                </div>
              ) : (
                <span className="font-bold text-gray-900">Menu</span>
              )}
              <button onClick={() => setMenuOpen(false)}
                      className="w-8 h-8 flex items-center
                                 justify-center text-gray-400
                                 hover:text-gray-600 rounded-lg">
                <svg className="w-5 h-5" fill="none"
                     stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={closeMenu} className={linkClass('/dashboard')}>
                    <svg className="w-5 h-5 mr-3 flex-shrink-0"
                         fill="none" stroke="currentColor"
                         viewBox="0 0 24 24">
                      <path strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </Link>
                  <Link to="/contributions" onClick={closeMenu}
                        className={linkClass('/contributions')}>
                    <svg className="w-5 h-5 mr-3 flex-shrink-0"
                         fill="none" stroke="currentColor"
                         viewBox="0 0 24 24">
                      <path strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    My History
                  </Link>
                  <Link to="/groups/new" onClick={closeMenu}
                        className={linkClass('/groups/new')}>
                    <svg className="w-5 h-5 mr-3 flex-shrink-0"
                         fill="none" stroke="currentColor"
                         viewBox="0 0 24 24">
                      <path strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4" />
                    </svg>
                    Create Group
                  </Link>
                  <Link to="/profile" onClick={closeMenu} className={linkClass('/profile')}>
                    <svg className="w-5 h-5 mr-3 flex-shrink-0"
                         fill="none" stroke="currentColor"
                         viewBox="0 0 24 24">
                      <path strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Account Settings
                  </Link>
                  {user.role === 'SUPER_ADMIN' && (
                    <Link to="/admin" onClick={closeMenu} className={linkClass('/admin')}>
                      <svg className="w-5 h-5 mr-3 flex-shrink-0"
                           fill="none" stroke="currentColor"
                           viewBox="0 0 24 24">
                        <path strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Admin Panel
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu} className={linkClass('/login')}>
                    Sign In
                  </Link>
                  <Link to="/register" onClick={closeMenu}
                        className={linkClass('/register')}>
                    Create Account
                  </Link>
                </>
              )}
            </nav>

            {user && (
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="
                    w-full flex items-center gap-3 px-3 py-2.5
                    text-sm font-medium text-red-600
                    hover:bg-red-50 rounded-lg
                    transition-colors
                  "
                >
                  <svg className="w-5 h-5" fill="none"
                       stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
