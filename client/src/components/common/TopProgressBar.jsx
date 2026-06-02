import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

function TopProgressBarInner() {
  const barRef = useRef(null);

  useEffect(() => {
    const bar = barRef.current;
    if (bar) {
      bar.style.width = '0%';
      requestAnimationFrame(() => {
        bar.style.width = '70%';
      });
    }

    const done = setTimeout(() => {
      if (bar) bar.style.width = '100%';
    }, 500);

    return () => clearTimeout(done);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-green-100 pointer-events-none">
      <div
        ref={barRef}
        className="h-full bg-green-600 transition-all duration-[400ms] ease-out"
      />
    </div>
  );
}

export default function TopProgressBar() {
  const location = useLocation();
  return <TopProgressBarInner key={location.pathname} />;
}
