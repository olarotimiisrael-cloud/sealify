{
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
  });
}

if (import.meta.env.DEV) {
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args) => {
    const msg = args[0]?.toString() || '';
    if (
      msg.includes('Cannot read properties of undefined') ||
      msg.includes('frame') ||
      msg.includes('HMR') ||
      msg.includes('vite') ||
      msg.includes('Warning:') ||
      msg.includes('useLayoutEffect')
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  console.warn = (...args) => {
    const msg = args[0]?.toString() || '';
    if (
      msg.includes('useLayoutEffect') ||
      msg.includes('component') ||
      msg.includes('key')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    if (e.message.includes('Cannot read properties') || e.message.includes('HMR')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);

  window.addEventListener('unhandledrejection', (e) => {
    if (e.reason?.message?.includes('Cannot read properties') || e.reason?.message?.includes('HMR')) {
      e.preventDefault();
      return false;
    }
  }, true);
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
    <Toaster
      position="bottom-right"
      richColors
      toastOptions={{
        duration: 4000,
        style: {
          background: '#0f172a',
          color: '#f8fafc',
          border: '1px solid #1e293b',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#0f172a',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#0f172a',
          },
        },
      }}
    />
  </QueryClientProvider>
);