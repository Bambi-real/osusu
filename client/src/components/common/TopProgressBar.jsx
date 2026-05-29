import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function TopProgressBarInner() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setProgress(60),  50);
    const t2 = setTimeout(() => setProgress(80),  200);
    const t3 = setTimeout(() => setProgress(95),  400);
    const t4 = setTimeout(() => setProgress(100), 600);

    return () => [t1,t2,t3,t4].forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-green-100 pointer-events-none">
      <div
        style={{ width: `${progress}%` }}
        className="h-full bg-green-600 transition-all duration-300 ease-out"
      />
    </div>
  );
}

export default function TopProgressBar() {
  const location = useLocation();
  return <TopProgressBarInner key={location.pathname} />;
}
