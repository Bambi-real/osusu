import { createContext, useContext, useState, useEffect } from 'react';

const OnlineStatusContext = createContext(true);

export function OnlineStatusProvider({ children }) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    function handleOnline() { setIsOnline(true); }
    function handleOffline() { setIsOnline(false); }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <OnlineStatusContext.Provider value={isOnline}>
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 text-white text-center text-sm font-medium py-2 px-4 shadow-lg">
          You are offline. Some features may be unavailable.
        </div>
      )}
      {children}
    </OnlineStatusContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOnlineStatus() {
  return useContext(OnlineStatusContext);
}
