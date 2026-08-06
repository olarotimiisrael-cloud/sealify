import React from 'react';
import { RefreshCw, AlertTriangle, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const isDev = import.meta.env.DEV;

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

        {isDev && error && (
          <details className="text-left p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <summary className="font-bold text-xs text-slate-300 cursor-pointer">Error Details</summary>
            <pre className="text-[10px] text-rose-300 overflow-auto max-h-40 font-mono">
              {error.toString()}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          <Button
            onClick={resetErrorBoundary}
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
};