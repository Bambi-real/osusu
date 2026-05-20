import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 w-full mt-auto py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white">
                <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
                  <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="2.5"/>
                  <circle cx="20" cy="6" r="3.5" fill="currentColor"/>
                  <circle cx="34" cy="20" r="3.5" fill="currentColor"/>
                  <circle cx="20" cy="34" r="3.5" fill="currentColor"/>
                  <circle cx="6" cy="20" r="3.5" fill="currentColor"/>
                  <path d="M20 6 A14 14 0 0 1 34 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-white text-xl font-bold tracking-tight">Osusu</span>
            </div>
            <p className="text-gray-400 text-sm">Saving together, the smart way.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
            <Link to="/dashboard" className="text-gray-400 hover:text-green-400 transition-colors font-medium">Dashboard</Link>
            <Link to="/groups/new" className="text-gray-400 hover:text-green-400 transition-colors font-medium">Create Group</Link>
            <Link to="/contributions" className="text-gray-400 hover:text-green-400 transition-colors font-medium">My History</Link>
          </div>
          <div className="flex flex-col items-center md:items-end gap-1">
            <p className="text-sm text-gray-400">Built for The Gambia 🇬🇲</p>
            <p className="text-xs text-gray-500">© {year} Osusu</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
