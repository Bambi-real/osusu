export default function Spinner({ fullPage }) {
  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-4" role="status">
      <span className="sr-only">Loading...</span>
      {fullPage && (
        <div className="flex items-center justify-center gap-2 mb-4 animate-pulse">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white">
            <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7">
              <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="2.5"/>
              <circle cx="20" cy="6" r="3.5" fill="currentColor"/>
              <circle cx="34" cy="20" r="3.5" fill="currentColor"/>
              <circle cx="20" cy="34" r="3.5" fill="currentColor"/>
              <circle cx="6" cy="20" r="3.5" fill="currentColor"/>
              <path d="M20 6 A14 14 0 0 1 34 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-green-700">Osusu</span>
        </div>
      )}
      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white z-50 fixed inset-0">
        {spinner}
      </div>
    );
  }

  return spinner;
}
