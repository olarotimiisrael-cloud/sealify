import { StrictMode } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <QueryClientProvider client={queryClient}>
        <StrictMode>
          <App />
        </StrictMode>
      </QueryClientProvider>
    ),
    errorElement: <div>Error loading page</div>,
  },
]);

export default function Root() {
  return <RouterProvider router={router} />;
}