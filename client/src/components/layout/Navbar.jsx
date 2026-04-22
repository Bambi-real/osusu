import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = user ? [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'My History', path: '/contributions' },
    { name: 'Profile', path: '/profile' }
  ] : [
    { name: 'Log In', path: '/login' },
    { name: 'Register', path: '/register' }
  ];

  return (
    <>
      <nav className={`bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200/60 transition-all ${scrolled ? 'shadow-sm' : ''} supports-[backdrop-filter]:bg-white/60`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-black shadow-indigo-500/30 shadow-lg group-hover:scale-105 group-active:scale-95 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 w-full h-1/2 rounded-t-xl" />
                  <span className="relative z-10 text-lg">O</span>
                </div>
                <span className="font-extrabold text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-400 group-hover:opacity-80 transition-opacity">OsusuApp</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link 
                    key={link.name} 
                    to={link.path} 
                    className={`relative text-sm font-bold transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                    )}
                  </Link>
                );
              })}
              {user && (
                <>
                  <div className="w-px h-6 bg-slate-200 hidden sm:block" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm uppercase">
                      {user.fullName ? user.fullName.charAt(0) : user.email.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden lg:block">{user.fullName?.split(' ')[0] || user.email.split('@')[0]}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={logout} className="!px-3 !py-2 text-slate-500 hover:text-rose-500 hover:bg-rose-50 font-bold">
                    Logout
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-slate-500 hover:text-slate-700 focus:outline-none p-2"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)}></div>
        <div className={`absolute top-0 right-0 w-64 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 space-y-6 mt-16">
            {user && (
              <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg uppercase">
                  {user.fullName ? user.fullName.charAt(0) : user.email.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{user.fullName || 'User'}</div>
                  <div className="text-xs text-gray-500 truncate w-40">{user.email}</div>
                </div>
              </div>
            )}
            
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  onClick={() => setMenuOpen(false)}
                  className={`block text-lg font-bold ${isActive ? 'text-indigo-600' : 'text-slate-600'}`}
                >
                  <div className="flex items-center">
                    {link.name}
                    {isActive && <span className="ml-2 w-2 h-2 bg-indigo-600 rounded-full"></span>}
                  </div>
                </Link>
              );
            })}
            
            {user && (
              <div className="pt-6 border-t border-slate-200">
                <button onClick={() => { logout(); setMenuOpen(false); }} className="text-lg font-bold text-rose-500 flex items-center w-full">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
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
