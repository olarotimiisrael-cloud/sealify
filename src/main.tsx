import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
  });
}

// Suppress Vite HMR errors in development
if (import.meta.env.DEV) {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      args[0]?.includes?.('Cannot read properties of undefined') ||
      args[0]?.includes?.('frame') ||
      args[0]?.includes?.('HMR') ||
      args[0]?.includes?.('vite')
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

createRoot(document.getElementById("root")!).render(<App />);