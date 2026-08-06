import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
  });
}

// Global error handler to prevent random errors from breaking the app
window.addEventListener('error', (event) => {
  // Prevent unhandled promise rejections from showing in console during hydration
  if (event.message.includes('hydration') || event.message.includes('Hydration')) {
    event.preventDefault();
    return false;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  // Prevent unhandled promise rejections during initial load
  if (event.reason?.message?.includes('hydration') || event.reason?.message?.includes('Hydration')) {
    event.preventDefault();
    return false;
  }
});

createRoot(document.getElementById("root")!).render(<App />);