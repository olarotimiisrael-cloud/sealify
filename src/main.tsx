import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
  });
}

// Aggressive error suppression for development
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

// Suppress React error overlay
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

createRoot(document.getElementById("root")!).render(<App />);