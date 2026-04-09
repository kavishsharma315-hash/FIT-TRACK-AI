import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl max-w-md overflow-auto">
            <p className="text-sm text-white/60 font-mono">
              {this.state.error?.message}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-neon-blue text-black font-bold px-6 py-2 rounded-xl"
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
