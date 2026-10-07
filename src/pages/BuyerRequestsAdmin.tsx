import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Mail, 
  Bell, 
  Phone, 
  MessageCircle,
  Clock,
  MapPin,
  Tag,
  DollarSign,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye
} from 'lucide-react';
import { useSealify } from '@/context/SealifyContext';
import { toast } from 'sonner';
import { BuyerRequest } from '@/types/sealify';

interface BuyerRequestsAdminProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BuyerRequestsAdmin: React.FC<BuyerRequestsAdminProps> = ({ onClose }) => {
  const { buyerRequests, user, isAdmin } = useSealify();
  const [requests, setRequests] = useState<BuyerRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BuyerRequest | null>(null);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSending, setIsSending] = useState(false);

  const categories = ['All', ...Array.from(new Set(requests.map(r => r.category)))];
  const filteredRequests = requests.filter((req) => {
    if (selectedCategory !== 'All' && req.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        req.title.toLowerCase().includes(q) ||
        req.description.toLowerCase().includes(q) ||
        req.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem('sealify_admin_token');
      const response = await fetch('/api/buyer-requests-admin', {
        headers: adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {},
      });
      const data = await response.json();
      if (data.requests) {
        setRequests(data.requests);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Failed to load buyer requests:', error);
      toast.error('Failed to load buyer requests');
    } finally {
      setLoading(false);
    }
  };

  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleNotify = async (target: 'all' | 'buyer' | 'seller' | 'individual', title: string, message: string, channel: 'in_app' | 'email' | 'sms' | 'whatsapp') => {
    if (!selectedRequest) return;

    setIsSending(true);
    try {
      const adminToken = localStorage.getItem('sealify_admin_token');
      const response = await fetch(`/api/buyer-requests-admin/${selectedRequest.id}/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          target,
          title,
          message,
          channel,
          sendEmail: channel === 'email' || channel === 'in_app',
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Notification triggered for ${data.target}. ${JSON.stringify(data.triggered)}.`);
      } else {
        toast.error(data.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setIsSending(false);
      setIsNotifyModalOpen(false);
      setSelectedRequest(null);
    }
  };

  const openNotifyModal = (req: BuyerRequest) => {
    setSelectedRequest(req);
    setIsNotifyModalOpen(true);
  };

  if (!user?.role || user.role !== 'admin') {
    return (
      <div className="p-6 text-center text-slate-400">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Admin access required</h3>
        <p className="text-sm">Only administrators can access the buyer requests management panel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-950/50 border border-slate-800/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-teal-400" />
              Buyer Requests Management
            </h2>
            <p className="text-xs text-slate-400">View all buyer want board requests and send notifications/emails to users.</p>
          </div>
          <button
            onClick={loadRequests}
            disabled={loading}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Refresh</span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-teal-950 to-slate-900 border border-teal-500/30 rounded-xl p-4">
            <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wider">Total Requests</p>
            <p className="text-2xl font-black text-white">{requests.length}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Open</p>
            <p className="text-2xl font-black text-white">{requests.filter(r => r.status === 'open').length}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-950 to-slate-900 border border-blue-500/30 rounded-xl p-4">
            <p className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">Responded</p>
            <p className="text-2xl font-black text-white">{requests.filter(r => r.status === 'responded').length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-950 to-slate-900 border border-purple-500/30 rounded-xl p-4">
            <p className="text-[9px] font-bold text-purple-400 uppercase tracking-wider">Budget Range</p>
            <p className="text-lg font-black text-white truncate">
              {requests.length ? `${formatNGN(Math.min(...requests.map(r => r.maxBudget)))} - ${formatNGN(Math.max(...requests.map(r => r.maxBudget)))}` : 'N/A'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-48 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
          <p className="text-sm text-slate-400 mt-4">Loading requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
          <HelpCircle className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white mt-4">No requests found</h3>
          <p className="text-sm text-slate-500 mt-2">No buyer requests match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-slate-900 border border-slate-800 hover:border-teal-500/40 rounded-3xl p-6 transition-all duration-300 shadow-xl flex flex-col space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={req.userAvatar}
                      alt={req.userName}
                      className="w-11 h-11 rounded-2xl object-cover border-2 border-teal-500"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-white">{req.userName}</h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" /> {req.createdAt}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                    req.status === 'open'
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : req.status === 'responded'
                      ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                      : 'text-slate-400 bg-slate-500/10 border-slate-500/20'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white">{req.title}</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{req.description}</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase block">Category</span>
                      <span className="text-slate-300 font-bold">{req.category}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase block">Budget</span>
                      <strong className="text-emerald-400 font-bold">{formatNGN(req.maxBudget)}</strong>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase block">Location</span>
                      <span className="text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-teal-400" /> {req.location}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase block">Responses</span>
                      <span className="text-slate-300 font-bold">{req.responsesCount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  onClick={() => openNotifyModal(req)}
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  <span>Notify Users</span>
                </button>
                <a
                  href={`/requests#${req.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notify Modal */}
      {isNotifyModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => {
                setIsNotifyModalOpen(false);
                setSelectedRequest(null);
              }}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1 mb-6">
              <div className="w-12 h-12 bg-teal-500/10 text-teal-400 rounded-2xl flex items-center justify-center mx-auto border border-teal-500/30">
                <Bell className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white">Notify Users About Request</h2>
              <p className="text-xs text-slate-400">Send a general notification or custom email to alert users about this request</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-300 font-bold">Request Being Notified About:</p>
                <p className="text-sm text-white mt-1 font-black">{selectedRequest.title}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedRequest.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Target Audience</label>
                  <select
                    id="notify-target"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">All Users</option>
                    <option value="buyer">Buyers</option>
                    <option value="seller">Sellers</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Channel</label>
                  <select
                    id="notify-channel"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="in_app">In-App Notification</option>
                    <option value="email">Custom Email</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Email Subject / Notification Title</label>
                <input
                  id="notify-title"
                  type="text"
                  placeholder="New Item Request Posted"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Custom Message (Optional)</label>
                <textarea
                  id="notify-message"
                  rows={4}
                  placeholder="Custom message to include in the notification or email..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>

            <button
              onClick={() => {
                const target = (document.getElementById('notify-target') as HTMLSelectElement).value as any;
                const channel = (document.getElementById('notify-channel') as HTMLSelectElement).value as any;
                const title = (document.getElementById('notify-title') as HTMLInputElement).value.trim();
                const message = (document.getElementById('notify-message') as HTMLTextAreaElement).value.trim();
                handleNotify(target, title, message, channel);
              }}
              disabled={isSending}
              className="w-full mt-6 py-3.5 bg-teal-500 hover:bg-teal-400 disabled:bg-teal-500/50 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Triggering Notification...</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span>Trigger Notification / Send Email</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerRequestsAdmin;
