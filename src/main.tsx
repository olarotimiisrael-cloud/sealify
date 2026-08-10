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

// Only suppress Vite HMR errors in development - NOT production errors
if (import.meta.env.DEV) {
  const originalError = console.error;
  console.error = (...args) => {
    const msg = args[0]?.toString() || '';
    // Only suppress known Vite/HMR noise, NOT real application errors
    if (
      msg.includes('HMR') ||
      msg.includes('vite') ||
      msg.includes('[vite]') ||
      msg.includes('WebSocket') ||
      msg.includes('hmr')
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
);