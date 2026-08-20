# Sealify Nigeria — Trusted Local Marketplace

A full-featured classifieds marketplace for Ogbomosoland, Oyo State, and across Nigeria. Built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

### Core Marketplace
- **Free Classified Listings** — Post ads for vehicles, electronics, real estate, fashion, services, jobs, and more
- **Verified Seller Badges** — NIN, CAC, Student ID, and Premium verification tiers
- **Safe Meetup Spots** — 50+ CCTV-monitored locations across Ogbomoso (Police HQs, LAUTECH Gate, Shopping Malls)
- **AI-Powered Tools** — Smart pricing, description generation, voice overviews, and shopping copilot
- **Real-time Chat** — Direct messaging with quick replies, voice notes, and photo sharing
- **Escrow Protection** — Secure fund holding with QR code verification for in-person handover

### Advanced Features
- **Social Promo Cards** — Generate high-res 1080x1080 flyers with QR codes for WhatsApp/social sharing
- **Item Swap & Trade-In** — Propose barter deals with cash top-up options
- **Physical Inspection Checklists** — Category-specific verification guides
- **PWA Support** — Install as native app on iOS/Android with offline access
- **Multi-language** — English, Yorùbá, Hausa, Igbo, 中文

### Admin Dashboard
- **Real-time Analytics** — Visitors, revenue, user growth, category distribution
- **User Management** — Edit roles, verification status, ban/suspend, bulk actions
- **Content Moderation** — Review verifications, promotions, disputes, reports
- **System Controls** — Maintenance mode, auto-approve, security settings
- **Database Tools** — SQL schema viewer, connection test, backup export
- **Broadcast System** — Push notifications and email digests to all users

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui, Radix UI |
| Routing | React Router v6 |
| State | React Context + localStorage + Supabase |
| Backend | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| Deployment | Cloudflare Pages / Vercel |
| PWA | Service Worker, Web App Manifest |
| Charts | Recharts |
| Notifications | Sonner (toast) |
| Icons | Lucide React |

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   ├── Admin*.tsx       # Admin dashboard modals
│   ├── *Modal.tsx       # Feature modals (30+)
│   ├── ListingCard.tsx  # Product card component
│   ├── Navbar.tsx       # Main navigation
│   ├── MobileNav.tsx    # Bottom mobile navigation
│   ├── Footer.tsx       # Site footer
│   ├── Logo.tsx         # Brand logo component
│   ├── SEO.tsx          # Dynamic meta tags
│   └── ...
├── pages/               # Route pages
│   ├── Index.tsx        # Homepage with marketplace feed
│   ├── ListingDetail.tsx # Full ad view with all actions
│   ├── PostAd.tsx       # Multi-step ad creation wizard
│   ├── MyAds.tsx        # User inventory management
│   ├── Messages.tsx     # Real-time chat inbox
│   ├── Settings.tsx     # Profile, storefront, security
│   ├── SellerProfile.tsx # Public vendor storefront
│   ├── VendorsPage.tsx  # Verified merchant directory
│   ├── AdminDashboard.tsx # Master admin terminal
│   ├── AdminLogin.tsx   # Secure admin authentication
│   ├── BuyerRequests.tsx # Want board / item requests
│   ├── CommunityBoard.tsx # News & announcements
│   ├── SafetyCenter.tsx # Trust & safety guidelines
│   ├── HowItWorks.tsx   # Platform guide & FAQ
│   ├── Notifications.tsx # Notification center
│   ├── SavedAds.tsx     # Bookmarked listings
│   ├── FAQ.tsx          # Frequently asked questions
│   ├── HelpCenter.tsx   # Support channels
│   ├── Contact.tsx      # Contact form
│   └── NotFound.tsx     # 404 page
├── context/
│   └── SealifyContext.tsx # Global state management
├── services/
│   └── supabaseService.ts # Supabase CRUD operations
├── api/                 # Hono API routes (Cloudflare Workers)
│   ├── auth.ts
│   ├── listings.ts
│   ├── messages.ts
│   ├── notifications.ts
│   ├── admin.ts
│   ├── users.ts
│   └── health.ts
├── db/
│   └── hyperdrive.ts    # PostgreSQL connection (Cloudflare Hyperdrive)
├── lib/
│   ├── supabase.ts      # Supabase client & types
│   └── utils.ts         # cn() className utility
├── hooks/
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   └── usePwaInstall.ts
├── translations/
│   └── languages.ts     # 5-language i18n
├── types/
│   ├── index.ts         # Legacy types
│   └── sealify.ts       # Complete type definitions
├── data/
│   └── mockData.ts      # Fallback mock data
├── App.tsx              # Root with providers & routes
├── main.tsx             # Entry point
├── globals.css          # Tailwind + custom styles
└── vite-env.d.ts
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+
- npm/pnpm/yarn
- Supabase account
- Cloudflare account (for Workers/Pages deployment)

### 1. Clone & Install
```bash
git clone <repository-url>
cd sealify-nigeria
npm install
```

### 2. Environment Variables
Create `.env` file:
```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Cloudflare (for API routes)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 3. Supabase Database Setup
1. Create new Supabase project
2. Run migration: `supabase/migrations/20240101000000_initial_schema.sql`
3. Run seed: `supabase/seed.sql`
4. Enable Realtime for tables (see seed.sql)
5. Configure Auth providers (Email, Phone)
6. Create storage buckets: `listing-photos`, `avatars`, `banners`, `documents`

### 4. Development
```bash
npm run dev
# Opens at http://localhost:5173
```

### 5. Build & Deploy
```bash
# Build for production
npm run build

# Deploy to Cloudflare Pages
npm run deploy

# Or deploy to Vercel
vercel --prod
```

## 🗄 Database Schema Overview

### Core Tables
- **users** — Profiles, verification, bank details, preferences
- **listings** — Classified ads with images, specs, promotion status
- **categories/subcategories** — Hierarchical taxonomy with spec fields
- **conversations/messages** — Real-time chat with read receipts
- **notifications** — Multi-type alerts (price drop, message, offer, etc.)
- **verification_requests** — NIN/CAC/Student ID applications
- **promotion_payments** — Top Ad boost receipts
- **disputes/reports** — Safety & moderation
- **reviews** — Buyer feedback on sellers
- **buyer_requests** — Want board listings
- **search_alerts** — Saved search notifications
- **safe_spots** — Verified meetup locations
- **announcements** — System banners & broadcasts
- **audit_logs/intrusion_logs** — Security tracking
- **system_configs/site_settings** — Platform configuration
- **promotion_plans** — Boost pricing tiers
- **recent_deals** — Live transaction ticker

## 🔐 Security Features

- **Admin Terminal** — Triple-factor auth (Email + Password + 6-digit PIN)
- **Intrusion Logging** — Device fingerprinting on failed admin attempts
- **Row Level Security** — Supabase RLS policies on all tables
- **Escrow QR Verification** — Cryptographic handover codes
- **Phone OTP** — SMS verification for sensitive actions
- **Password Reset** — NIN + ID document required

## 🌍 Localization

Supported languages (in `src/translations/languages.ts`):
- English (en) — Default
- Yorùbá (yo) — Nigeria Southwest
- Hausa (ha) — Nigeria North
- Igbo (ig) — Nigeria Southeast
- 中文 (zh) — Chinese

## 📱 PWA Installation

### Android (Chrome/Edge/Firefox)
1. Open site → Menu → "Install App" or "Add to Home Screen"
2. Or use the "Install Sealify App" button in footer/settings

### iOS (Safari only)
1. Open in Safari (not in-app browser)
2. Tap Share → "Add to Home Screen"
3. App runs full-screen with offline support

### Desktop
1. Chrome/Edge address bar → Install icon
2. Runs as standalone window

## 🧪 Testing

```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Preview production build
npm run preview
```

## 📦 Key Components Reference

### Modal Components (30+)
| Component | Purpose |
|-----------|---------|
| `OfferModal` | Price negotiation |
| `SwapProposalModal` | Barter/trade-in deals |
| `SafeMeetupModal` | Verified location picker |
| `StorefrontFlycardModal` | 1080x1080 social promo cards |
| `AiVoiceOverviewModal` | Spoken product briefings |
| `PromoteModal` | Top Ad boost payments |
| `VerificationModal` | NIN/CAC badge application |
| `AdminEditUserModal` | User management |
| `AdminSettingsModal` | Root credentials & security |
| `SqlSchemaViewer` | Database migration script |
| `DatabaseTest` | Supabase connection test |

### Core UI Components
- `ListingCard` — Product grid card with actions
- `VerifiedBadge` — Trust tier indicators (Individual/Business/Premium/Student)
- `TrustScore` — Seller reputation widget
- `CategoryBar/Grid` — Filter navigation
- `NeighborhoodFilter` — Ogbomoso zone picker
- `FilterDrawer` — Advanced search filters
- `CompareModal` — Side-by-side ad comparison
- `SavedAlertsModal` — Search subscription management
- `AiShoppingAssistantModal` — GPT-style shopping copilot

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License — see LICENSE file for details.

## 🙏 Acknowledgments

- **Supabase** — Backend-as-a-Service
- **shadcn/ui** — Beautiful accessible components
- **Tailwind CSS** — Utility-first styling
- **Lucide React** — Clean icon system
- **Recharts** — Composable charting
- **Sonner** — Toast notifications
- **Cloudflare** — Edge deployment & Hyperdrive

## 📞 Support

- **Email**: support@sealify.ng
- **Phone**: +234 813 120 8468
- **WhatsApp Channel**: [Follow for updates](https://whatsapp.com/channel/0029VaqFIYEC6ZvlrPCLql1R)
- **Community Group**: [Join discussion](https://chat.whatsapp.com/F0iRCn1r1z2JQuKLoRhmw4)

---

**Sealify Nigeria** — Connecting verified buyers & sellers across Ogbomosoland & Oyo State since 2024.