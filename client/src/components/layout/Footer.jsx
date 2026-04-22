export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 px-6 w-full mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left mb-8">
        
        {/* Left: Logo + Tagline */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">O</div>
            <span className="text-white text-xl font-bold tracking-tight">OsusuApp</span>
          </div>
          <p className="text-sm">Saving together, the smart way.</p>
        </div>

        {/* Centre: Nav Links */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-sm font-medium">
          <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
          <a href="/groups/new" className="hover:text-white transition-colors">Create Group</a>
          <a href="/profile" className="hover:text-white transition-colors">Profile</a>
        </div>

        {/* Right: Built for */}
        <div className="text-sm">
          <p>Built for The Gambia 🇬🇲</p>
          <p className="hidden md:block mt-1">© {year}</p>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="max-w-6xl mx-auto border-t border-gray-800 pt-6 text-center md:text-left text-xs text-gray-500">
        © {year} OsusuApp. University of The Gambia — Final Year Project.
      </div>
    </footer>
  );
}
