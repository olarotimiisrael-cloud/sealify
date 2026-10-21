import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { SealifyProvider } from "./context/SealifyContext";
import { SiteMetadataProvider } from "./context/SiteMetadataContext";
import { LanguageProvider } from "./context/LanguageContext";
import SplashScreen from "./components/SplashScreen";
import ToasterWrapper from "./components/ToasterWrapper";
import ErrorBoundary from "./components/ErrorBoundary";
import AdminRouteGuard from "./components/AdminRouteGuard";
import { FloatingCopilotWrapper } from "./components/FloatingCopilot";

const Index = lazy(() => import("./pages/Index"));
const ListingDetail = lazy(() => import("./pages/ListingDetail"));
const Listings = lazy(() => import("./pages/Listings"));
const Services = lazy(() => import("./pages/Services"));
const PostAd = lazy(() => import("./pages/PostAd"));
const Messages = lazy(() => import("./pages/Messages"));
const Conversations = lazy(() => import("./pages/Conversations"));
const ConversationDetail = lazy(() => import("./pages/ConversationDetail"));
const SavedAds = lazy(() => import("./pages/SavedAds"));
const SavedSearches = lazy(() => import("./pages/SavedSearches"));
const MyAds = lazy(() => import("./pages/MyAds"));
const SellerProfile = lazy(() => import("./pages/SellerProfile"));
const Settings = lazy(() => import("./pages/Settings"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const BankAccounts = lazy(() => import("./pages/BankAccounts"));
const NotFound = lazy(() => import("./pages/NotFound"));
const FAQ = lazy(() => import("./pages/FAQ"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const Contact = lazy(() => import("./pages/Contact"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminCategories = lazy(() => import("./pages/AdminCategories"));
const AdminAiSettingsPage = lazy(() => import("./pages/AdminAiSettings"));
const AdminSiteMetadataPage = lazy(() => import("./pages/AdminSiteMetadata"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Verify = lazy(() => import("./pages/Verify"));
const Otp = lazy(() => import("./pages/Otp"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Notifications = lazy(() => import("./pages/Notifications"));
const SafetyCenter = lazy(() => import("./pages/SafetyCenter"));
const DisputeResolution = lazy(() => import("./pages/DisputeResolution"));
const BuyerRequests = lazy(() => import("./pages/BuyerRequests"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const CommunityBoard = lazy(() => import("./pages/CommunityBoard"));
const VendorsPage = lazy(() => import("./pages/VendorsPage"));
const ProfileComplete = lazy(() => import("./pages/ProfileComplete"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const UserListings = lazy(() => import("./pages/UserListings"));
const CategoryDetail = lazy(() => import("./pages/CategoryDetail"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const MarketInsights = lazy(() => import("./pages/MarketInsights"));
const Payments = lazy(() => import("./pages/Payments"));
const Promotions = lazy(() => import("./pages/Promotions"));
const Kyc = lazy(() => import("./pages/Kyc"));
const Referrals = lazy(() => import("./pages/Referrals"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminListings = lazy(() => import("./pages/AdminListings"));
const AdminReports = lazy(() => import("./pages/AdminReports"));
const AdminDisputes = lazy(() => import("./pages/AdminDisputes"));
const AdminSystemConfig = lazy(() => import("./pages/AdminSystemConfig"));

const routeFallback = (
  <div className="min-h-screen bg-white flex items-center justify-center text-slate-500 text-sm font-medium">
    Loading…
  </div>
);

const App = () => (
  <ErrorBoundary>
    <LanguageProvider>
      <SealifyProvider>
        <SiteMetadataProvider />
        <SplashScreen />
        <ToasterWrapper />
        <FloatingCopilotWrapper />
        <Suspense fallback={routeFallback}>
          <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/categories" element={<Index />} />
          <Route path="/categories/:slug" element={<CategoryDetail />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/market-insights" element={<MarketInsights />} />

          {/* Auth */}
          <Route path="/auth/login" element={<Auth />} />
          <Route path="/auth/register" element={<Auth />} />
          <Route path="/auth/verify" element={<Verify />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/otp" element={<Otp />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* User profile & listings */}
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/user/:id/listings" element={<UserListings />} />
          <Route path="/profile" element={<Settings />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/bank-accounts" element={<BankAccounts />} />

          {/* Listings */}
          <Route path="/post-ad" element={<PostAd />} />

          {/* Messaging */}
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:id" element={<ConversationDetail />} />
          <Route path="/conversations" element={<Conversations />} />

          {/* Payments & Promotions */}
          <Route path="/payments" element={<Payments />} />
          <Route path="/promotions" element={<Promotions />} />

          {/* KYC & Referrals */}
          <Route path="/kyc" element={<Kyc />} />
          <Route path="/referrals" element={<Referrals />} />

          {/* Notifications */}
          <Route path="/notifications" element={<Notifications />} />

          {/* Saved */}
          <Route path="/saved" element={<SavedAds />} />
          <Route path="/saved-searches" element={<SavedSearches />} />
          <Route path="/my-ads" element={<MyAds />} />

          {/* Seller/Vendors */}
          <Route path="/seller/:id" element={<SellerProfile />} />
          <Route path="/vendors" element={<VendorsPage />} />

          {/* Community & Safety */}
          <Route path="/community" element={<CommunityBoard />} />
          <Route path="/safety" element={<SafetyCenter />} />
          <Route path="/dispute" element={<DisputeResolution />} />
          <Route path="/requests" element={<BuyerRequests />} />

          {/* Profile Complete */}
          <Route path="/profile-complete" element={<ProfileComplete />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRouteGuard><AdminDashboard /></AdminRouteGuard>} />
          <Route path="/admin/users" element={<AdminRouteGuard><AdminUsers /></AdminRouteGuard>} />
          <Route path="/admin/listings" element={<AdminRouteGuard><AdminListings /></AdminRouteGuard>} />
          <Route path="/admin/reports" element={<AdminRouteGuard><AdminReports /></AdminRouteGuard>} />
          <Route path="/admin/disputes" element={<AdminRouteGuard><AdminDisputes /></AdminRouteGuard>} />
          <Route path="/admin/verifications" element={<AdminRouteGuard><AdminDashboard /></AdminRouteGuard>} />
          <Route path="/admin/promotions" element={<AdminRouteGuard><AdminDashboard /></AdminRouteGuard>} />
          <Route path="/admin/system-config" element={<AdminRouteGuard><AdminSystemConfig /></AdminRouteGuard>} />
          <Route path="/admin/categories" element={<AdminRouteGuard><AdminCategories /></AdminRouteGuard>} />
          <Route path="/admin/ai-settings" element={<AdminRouteGuard><AdminAiSettingsPage /></AdminRouteGuard>} />
          <Route path="/admin/site-metadata" element={<AdminRouteGuard><AdminSiteMetadataPage /></AdminRouteGuard>} />
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </SealifyProvider>
    </LanguageProvider>
  </ErrorBoundary>
);

export default App;
