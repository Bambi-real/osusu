import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { OnlineStatusProvider } from './providers/OnlineStatusProvider'
import ErrorBoundary from './components/common/ErrorBoundary'

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE || 'development',
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 0,
  });
}

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  if (import.meta.env.DEV) {
    console.warn('[App] Unhandled rejection:', event.reason);
  }
  if (SENTRY_DSN) {
    Sentry.captureException(event.reason, {
      extra: { type: 'unhandledRejection' },
    });
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <OnlineStatusProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
      </OnlineStatusProvider>
    </ErrorBoundary>
  </StrictMode>,
)
