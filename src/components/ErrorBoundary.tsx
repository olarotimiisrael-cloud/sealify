import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // Send to Sentry or logging service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error);
    }
  }

  private resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetErrorBoundary={this.resetErrorBoundary} />;
      }

      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
              <Bug className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white">Something went wrong</h2>
              <p className="text-xs text-slate-400">
                We caught an error in the component tree. The development team has been notified.
              </p>
            </div>

            {this.state.error && (
              <details className="text-left p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <summary className="font-bold text-xs text-slate-300 cursor-pointer">Error Details</summary>
                <pre className="text-[10px] text-rose-300 overflow-auto max-h-40 font-mono">
                  {this.state.error.toString()}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.resetErrorBoundary}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2 border-slate-700 text-slate-300 hover:text-white"
              >
                <Home className="w-4 h-4" />
                <span>Go Home</span>
              </Button>
            </div>

            <p className="text-[10px] text-slate-500 font-mono">
              Error Boundary Active • Sealify Nigeria
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;