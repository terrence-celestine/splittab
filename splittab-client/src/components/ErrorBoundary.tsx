import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <svg
              className="w-7 h-7 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            something went wrong
          </h1>
          <p className="text-sm text-gray-400 text-center mb-6">
            an unexpected error occurred. try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-500 text-white rounded-xl px-6 py-3 text-sm font-medium hover:bg-emerald-600 transition-colors"
          >
            refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
