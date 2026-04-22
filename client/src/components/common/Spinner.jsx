export default function Spinner({ fullPage }) {
  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {fullPage && (
        <div className="flex items-center justify-center gap-2 mb-4 animate-pulse">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">O</span>
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-400">OsusuApp</span>
        </div>
      )}
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
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