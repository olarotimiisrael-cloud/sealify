import React from 'react';
import { 
  Server, Database, Monitor, Smartphone, Cloud, Shield, 
  Zap, GitBranch, Users, Lock, Globe, Wifi, Cpu, 
  HardDrive, Network, ArrowRight, ArrowLeft, ArrowDown, 
  ArrowUp, Layers, Box, Cpu as CpuIcon
} from 'lucide-react';

const ArchitectureDiagram: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-black text-white flex items-center justify-center gap-3">
          <Layers className="w-6 h-6 text-emerald-400" />
          System Architecture Overview
        </h2>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Three-tier distributed architecture deployed on Cloudflare's global edge network with Supabase backend
        </p>
      </div>

      {/* Architecture Layers */}
      <div className="space-y-8">
        {/* Presentation Layer */}
        <div className="bg-slate-950 border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/30 shrink-0">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <span>Presentation Layer</span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">CLIENT</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">React 19 + TypeScript SSR on Cloudflare Pages</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className="font-bold text-white">PWA Frontend</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• React 19 + TypeScript + Tailwind</li>
                <li>• Server-Side Rendering (SSR)</li>
                <li>• Service Worker + Offline Cache</li>
                <li>• Native Install (Android/iOS)</li>
                <li>• Push Notifications (VAPID)</li>
                <li>• Background Sync Queue</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <Monitor className="w-4 h-4" />
                </div>
                <span className="font-bold text-white">Web Features</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Real-time Chat (WebSockets)</li>
                <li>• Voice Notes Recording</li>
                <li>• Image Upload + Preview</li>
                <li>• AI Voice Overview (TTS)</li>
                <li>• QR Code Scanner/Generator</li>
                <li>• Interactive Maps</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-bold text-white">Security</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• CSP Headers (Strict)</li>
                <li>• Biometric App Lock (WebAuthn)</li>
                <li>• Secure QR Handover</li>
                <li>• Rate Limiting (Client-side)</li>
                <li>• Input Sanitization</li>
                <li>• Secure Storage (IndexedDB)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Application Layer */}
        <div className="bg-slate-950 border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/30 shrink-0">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <span>Application Layer</span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">EDGE</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Cloudflare Workers (Hono) - 30+ REST API Endpoints</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, title: 'Auth Service', items: ['Email/Password', 'Phone OTP', 'Session Mgmt', 'Password Reset (NIN)', 'Admin Triple-Factor'], color: 'bg-emerald-500/10 text-emerald-400', iconColor: 'text-emerald-400' },
              { icon: Database, title: 'Listings API', items: ['CRUD + Images', 'Daily Limits (10/day)', 'Featured Toggle', 'Promotion Mgmt', 'View Counting', 'AI Description'], color: 'bg-blue-500/10 text-blue-400', iconColor: 'text-blue-400' },
              { icon: Zap, title: 'Messaging', items: ['Real-time Chat', 'Voice Notes', 'Read Receipts', 'Quick Replies', 'Action Buttons', 'Notifications'], color: 'bg-purple-500/10 text-purple-400', iconColor: 'text-purple-400' },
              { icon: Shield, title: 'Escrow', items: ['QR Handover', 'Inspection Phase', 'Buyer Release', 'Seller Payout', 'Ad Status Sync', 'Dispute Link'], color: 'bg-teal-500/10 text-teal-400', iconColor: 'text-teal-400' },
            ].map((service, i) => (
              <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${service.color}`}>
                    <service.icon className={`w-4 h-4 ${service.iconColor}`} />
                  </div>
                  <span className="font-bold text-white">{service.title}</span>
                </div>
                <ul className="text-xs text-slate-400 space-y-1">
                  {service.items.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}

            {[
              { icon: Zap, title: 'Wallet', items: ['Balance Tracking', 'Escrow Pending', 'Payout Requests', 'Transaction History', 'Bank Details', 'Min ₦1,000'], color: 'bg-amber-500/10 text-amber-400', iconColor: 'text-amber-400' },
              { icon: Lock, title: 'Admin API', items: ['User Mgmt (Bulk)', 'Content Moderation', 'Finance Dashboard', 'Security Audit', 'DB Tools', 'Broadcast'], color: 'bg-rose-500/10 text-rose-400', iconColor: 'text-rose-400' },
              { icon: Globe, title: 'Search/Analytics', items: ['Full-text Search', 'Price Guard', 'Market Stats', 'AI Recommendations', 'Event Tracking', 'Performance Metrics'], color: 'bg-cyan-500/10 text-cyan-400', iconColor: 'text-cyan-400' },
              { icon: Users, title: 'Push/Notifications', items: ['VAPID WebPush', 'Mass Broadcast', 'Email Digest', 'Price Alerts', 'In-app Notifs', 'Offline Queue'], color: 'bg-indigo-500/10 text-indigo-400', iconColor: 'text-indigo-400' },
            ].map((service, i) => (
              <div key={i + 4} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${service.color}`}>
                    <service.icon className={`w-4 h-4 ${service.iconColor}`} />
                  </div>
                  <span className="font-bold text-white">{service.title}</span>
                </div>
                <ul className="text-xs text-slate-400 space-y-1">
                  {service.items.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Data Layer */}
        <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <span>Data Layer</span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">PERSISTENCE</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Supabase (PostgreSQL 15) + Realtime + Storage + Auth</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Database className="w-4 h-4" />
                </div>
                <span className="font-bold text-white">PostgreSQL Database</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• 31 Tables (Normalized)</li>
                <li>• Row Level Security (All Tables)</li>
                <li>• Indexes on FK + Search Columns</li>
                <li>• Auto-timestamp Triggers</li>
                <li>• JSONB for Specs/Metadata</li>
                <li>• UUID Primary Keys</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="font-bold text-white">Realtime Engine</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• PostgreSQL Logical Replication</li>
                <li>• WebSocket Connections</li>
                <li>• Channels: messages, notifications, ads, conversations, wallets, escrow</li>
                <li>• Presence & Broadcast</li>
                <li>• Less than 100ms Latency</li>
                <li>• Auto-reconnection</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                  <Cloud className="w-4 h-4" />
                </div>
                <span className="font-bold text-white">Supabase Storage</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• profile-media (Avatars, KYC)</li>
                <li>• ad-images (Listing Photos)</li>
                <li>• documents (Receipts, KYC)</li>
                <li>• Public Read + Owner Write</li>
                <li>• CDN Delivery</li>
                <li>• Transform API (Resize)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Infrastructure & Security */}
        <div className="bg-slate-950 border border-rose-500/30 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/30 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <span>Infrastructure & Security</span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">CLOUDFLARE</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Global Edge Network + WAF + DDoS + SSL</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="font-bold text-white">WAF & DDoS</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Managed Ruleset (OWASP)</li>
                <li>• Rate Limiting (30/min API)</li>
                <li>• Bot Fight Mode</li>
                <li>• Custom Rules (Admin/Auth)</li>
                <li>• IP Reputation</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                  <Cpu className="w-4 h-4" />
                </div>
                <span className="font-bold text-white">Edge Compute</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• 300+ Edge Locations</li>
                <li>• V8 Isolates (0ms Cold Start)</li>
                <li>• Workers + Pages Functions</li>
                <li>• KV / Durable Objects</li>
                <li>• Cron Triggers</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Network className="w-4 h-4" />
                </div>
                <span className="font-bold text-white">Caching & CDN</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Static Assets: 1 Year</li>
                <li>• API: Stale-While-Revalidate</li>
                <li>• HTML: Must-Revalidate</li>
                <li>• Brotli Compression</li>
                <li>• Early Hints (103)</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <Globe className="w-4 h-4" />
                </div>
                <span className="font-bold text-white">DNS & SSL</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Cloudflare DNS</li>
                <li>• Universal SSL (Auto)</li>
                <li>• HSTS Preload</li>
                <li>• Certificate Transparency</li>
                <li>• Custom Domain Support</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Flow Diagram */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-[2.5rem] p-8">
          <h3 className="font-bold text-xl text-white text-center mb-8 flex items-center justify-center gap-2">
            <GitBranch className="w-5 h-5 text-emerald-400" />
            Request Flow Architecture
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs">
              <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono">Client</div>
              <ArrowRight className="text-emerald-400" />
              <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-mono">Cloudflare Edge</div>
              <ArrowRight className="text-emerald-400" />
              <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 font-mono">Workers API</div>
              <ArrowRight className="text-emerald-400" />
              <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-mono">Supabase</div>
              <ArrowRight className="text-emerald-400" />
              <div className="px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400 font-mono">PostgreSQL</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <ArrowDown className="text-emerald-400" />
                  <span className="font-bold text-emerald-400">GET /api/listings</span>
                </div>
                <p className="text-xs text-slate-400">1. Cloudflare caches static assets</p>
                <p className="text-xs text-slate-400">2. Edge validates JWT</p>
                <p className="text-xs text-slate-400">3. Worker queries Supabase</p>
                <p className="text-xs text-slate-400">4. Returns JSON + Cache headers</p>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <ArrowDown className="text-blue-400" />
                  <span className="font-bold text-blue-400">POST /api/messages</span>
                </div>
                <p className="text-xs text-slate-400">1. Auth validation</p>
                <p className="text-xs text-slate-400">2. Insert into Supabase</p>
                <p className="text-xs text-slate-400">3. Realtime broadcasts</p>
                <p className="text-xs text-slate-400">4. Push notification queued</p>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <ArrowDown className="text-purple-400" />
                  <span className="font-bold text-purple-400">POST /api/escrow</span>
                </div>
                <p className="text-xs text-slate-400">1. Verify ad + ownership</p>
                <p className="text-xs text-slate-400">2. Generate handover code</p>
                <p className="text-xs text-slate-400">3. Hold funds in wallet</p>
                <p className="text-xs text-slate-400">4. QR code generated</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureDiagram;