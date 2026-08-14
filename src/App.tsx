import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { SealifyProvider } from "./context/SealifyContext";
import SplashScreen from "./components/SplashScreen";
import ToasterWrapper from "./components/ToasterWrapper";
import ErrorBoundary from "./components/ErrorBoundary";

const Index = lazy(() => import("./pages/Index"));
const ListingDetail = lazy(() => import("./pages/ListingDetail"));
const PostAd = lazy(() => import("./pages/PostAd"));
const Messages = lazy(() => import("./pages/Messages"));
const SavedAds = lazy(() => import("./pages/SavedAds"));
const MyAds = lazy(() => import("./pages/MyAds"));
const SellerProfile = lazy(() => import("./pages/SellerProfile"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const FAQ = lazy(() => import("./pages/FAQ"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const Contact = lazy(() => import("./pages/Contact"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Notifications = lazy(() => import("./pages/Notifications"));
const SafetyCenter = lazy(() => import("./pages/SafetyCenter"));
const DisputeResolution = lazy(() => import("./pages/DisputeResolution"));
const MarketInsights = lazy(() => import("./pages/MarketInsights"));
const BuyerRequests = lazy(() => import("./pages/BuyerRequests"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const EscrowVerifier = lazy(() => import("./pages/EscrowVerifier"));
const CommunityBoard = lazy(() => import("./pages/CommunityBoard"));
const Wallet = lazy(() => import("./pages/Wallet"));
const VendorsPage = lazy(() => import("./pages/VendorsPage"));

const routeFallback = (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300 text-sm font-medium">
    Loading…
  </div>
);

const App = () => (
  <ErrorBoundary>
    <SealifyProvider>
      <SplashScreen />
      <ToasterWrapper />
      <Suspense fallback={routeFallback}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/seller/:id" element={<SellerProfile />} />
          <Route path="/vendors" element={<VendorsPage />} />
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
          <Route path="/safety" element={<SafetyCenter />} />
          <Route path="/dispute" element={<DisputeResolution />} />
          <Route path="/market-insights" element={<MarketInsights />} />
          <Route path="/requests" element={<BuyerRequests />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/escrow-verify" element={<EscrowVerifier />} />
          <Route path="/community" element={<CommunityBoard />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </SealifyProvider>
  </ErrorBoundary>
);

export default App;