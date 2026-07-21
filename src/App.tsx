import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";

import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import PostAd from "./pages/PostAd";
import Dashboard from "./pages/Dashboard";
import SavedItems from "./pages/SavedItems";
import MessagesPage from "./pages/MessagesPage";
import NotFound from "./pages/NotFound";

const App = () => (
  <AppProvider>
    <Toaster position="top-center" />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/post-ad" element={<PostAd />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/saved" element={<SavedItems />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </AppProvider>
);

export default App;