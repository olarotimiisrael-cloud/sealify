import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SealifyProvider } from "./context/SealifyContext";
import Index from "./pages/Index";
import ListingDetail from "./pages/ListingDetail";
import PostAd from "./pages/PostAd";
import Messages from "./pages/Messages";
import SavedAds from "./pages/SavedAds";
import MyAds from "./pages/MyAds";
import NotFound from "./pages/NotFound";

const App = () => (
  <SealifyProvider>
    <Toaster position="bottom-right" richColors />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/post-ad" element={<PostAd />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/saved" element={<SavedAds />} />
        <Route path="/my-ads" element={<MyAds />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </SealifyProvider>
);

export default App;