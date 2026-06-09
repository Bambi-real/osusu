import { Component } from 'react';
import * as Sentry from '@sentry/react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info);
    }
    Sentry.captureException(error, { extra: { componentStack: info?.componentStack } });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center
                        justify-center text-center px-4">
          <div>
            <div className="w-16 h-16 bg-red-100 rounded-2xl
                            flex items-center justify-center
                            mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-500 mb-6 max-w-sm">
              An unexpected error occurred.
              Please refresh the page.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-green-600 hover:bg-green-700
                         text-white font-semibold px-6 py-3
                         rounded-xl transition-all min-h-[44px]">
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
