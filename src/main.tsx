import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./globals.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Sealify: #root element was not found in index.html");
}

createRoot(rootElement).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
);

/**
 * Service worker lifecycle.
 *
 * Push notifications depend on a registered worker, but an unmanaged worker is
 * a liability: when a deployment replaces the build output, a worker left on an
 * older version can serve a cached app shell that references chunk files which
 * no longer exist. The browser then rejects every module as text/html and the
 * app renders "Something went wrong".
 *
 * Registering here keeps the worker current and hands control to a new version
 * as soon as it is waiting, so a deploy cannot strand a returning visitor.
 */
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      const activateWaitingWorker = (worker: ServiceWorker | null) => {
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            worker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      };

      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      registration.addEventListener('updatefound', () => {
        activateWaitingWorker(registration.installing);
      });
    }).catch(() => {
      // A failed registration must never break the app; push notifications
      // degrade, everything else keeps working.
    });
  });
}