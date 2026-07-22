import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SealifyProvider } from "./context/SealifyContext";
import Index from "./pages/Index";
import ListingDetail from "./pages/ListingDetail";
import PostAd from "./pages/PostAd";
import Messages from "./pages/Messages";
import SavedAds from "./pages/SavedAds";
import MyAds from "./pages/MyAds";
import SellerProfile from "./pages/SellerProfile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import FAQ from "./pages/FAQ";
import HelpCenter from "./pages/HelpCenter";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import Notifications from "./pages/Notifications";

const App = () => (
  <SealifyProvider>
    <Toaster position="bottom-right" richColors />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/seller/:id" element={<SellerProfile />} />
        <Route path="/post-ad" element={<PostAd />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/saved" element={<SavedAds />} />
        <Route path="/my-ads" element={<MyAds />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </SealifyProvider>
);

export default App;