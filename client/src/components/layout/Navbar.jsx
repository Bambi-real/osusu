import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isActive = (path) => {
    if (path === '/dashboard')
      return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const linkClass = (path) => `
    px-3 py-1.5 rounded-lg text-sm font-medium
    transition-colors duration-150
    ${isActive(path)
      ? 'bg-green-50 text-green-700'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }
  `;

  const navLinks = user ? [
    { name: 'Dashboard', path: '/dashboard', icon: (
      <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    )},
    { name: 'My History', path: '/contributions', icon: (
      <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125V9M7.5 12h.75M12 12h.75M16.5 12h.75M7.5 15.75h.75M12 15.75h.75M16.5 15.75h.75" />
      </svg>
    )}
  ] : [];

  const guestLinks = [
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Features', path: '/#features' },
    { name: 'Log In', path: '/login' },
    { name: 'Register', path: '/register' }
  ];

  return (
    <>
      <nav className={`sticky top-0 z-50 bg-white border-b border-gray-200 transition-shadow duration-200 ${scrolled ? 'shadow-sm' : 'shadow-none'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white shadow-green-600/30 shadow-lg group-hover:scale-105 group-active:scale-95 transition-all duration-300 relative overflow-hidden">
                  <svg aria-hidden="true" viewBox="0 0 40 40" fill="none" className="w-7 h-7">
                    <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="2.5"/>
                    <circle cx="20" cy="6" r="3.5" fill="currentColor"/>
                    <circle cx="34" cy="20" r="3.5" fill="currentColor"/>
                    <circle cx="20" cy="34" r="3.5" fill="currentColor"/>
                    <circle cx="6" cy="20" r="3.5" fill="currentColor"/>
                    <path d="M20 6 A14 14 0 0 1 34 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="font-extrabold text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400 group-hover:opacity-80 transition-opacity">Osusu</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {user ? (
                <>
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={linkClass(link.path)}
                    >
                      {link.name}
                    </Link>
                  ))}

                  <div className="w-px h-6 bg-slate-200 mx-3" />

                  <Link
                    to="/groups/new"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95"
                  >
                    <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    New Group
                  </Link>

                  <div className="w-px h-6 bg-slate-200 mx-3 hidden lg:block" />

                  <div className="flex items-center gap-2 pl-1">
                    <button onClick={() => navigate('/profile')}
                            aria-label="View profile"
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {user?.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-700 hidden sm:block">
                        {user?.fullName?.split(' ')[0]}
                      </span>
                    </button>
                    <button
                      onClick={logout}
                      aria-label="Logout"
                      className="ml-1 p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                      title="Logout"
                    >
                      <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {guestLinks.map((link) => {
                    const active = isActive(link.path);
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          active
                            ? 'bg-green-50 text-green-700'
                            : 'text-slate-600 hover:text-green-600 hover:bg-green-50/60'
                        }`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                className="relative w-10 h-10 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none transition-all"
              >
                <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
                <svg aria-hidden="true" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
        <div className={`absolute top-0 right-0 w-72 max-w-[85vw] h-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* User profile section */}
            {user && (
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{user.fullName || 'User'}</div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Nav links */}
            <div className="flex-1 p-4 space-y-1">
              {(user ? navLinks : guestLinks).map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMenuOpen(false)}
                    tabIndex={menuOpen ? 0 : -1}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base transition-all ${
                      active
                        ? 'text-green-700 bg-green-50 font-semibold'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium'
                    }`}
                  >
                    {link.icon && (
                      <span className={`${active ? 'text-green-600' : 'text-slate-400'}`}>{link.icon}</span>
                    )}
                    {link.name}
                    {active && (
                      <span className="ml-auto w-2 h-2 bg-green-600 rounded-full" />
                    )}
                  </Link>
                );
              })}

              {user && (
                <Link
                  to="/groups/new"
                  onClick={() => setMenuOpen(false)}
                  tabIndex={menuOpen ? 0 : -1}
                  className="flex items-center gap-3 px-4 py-3 mt-3 rounded-xl bg-green-600 text-white font-semibold text-base shadow-sm active:scale-[0.98] transition-all"
                >
                  <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  New Group
                </Link>
              )}
            </div>

            {/* Logout */}
            {user && (
              <div className="p-4 border-t border-slate-100">
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  tabIndex={menuOpen ? 0 : -1}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-semibold text-rose-500 hover:bg-rose-50 transition-all"
                >
                  <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
