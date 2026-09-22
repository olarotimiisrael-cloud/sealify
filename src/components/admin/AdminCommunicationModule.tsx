import React, { useState, useEffect, useCallback } from 'react';
import { Send, MessageSquare, Mail, Smartphone, Trash2, UserPlus, Loader2, CheckCircle2, Info } from 'lucide-react';
import { useAdminMessaging } from '@/hooks/useAdminMessaging';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AdminCommunicationModuleProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminCommunicationModule: React.FC<AdminCommunicationModuleProps> = ({ isOpen, onClose }) => {
  const { loading, error, sendMessage, broadcast, listMessages, listBroadcasts, getConfig } = useAdminMessaging();
  
  // State for individual messaging
  const [target, setTarget] = useState<'all' | 'buyer' | 'seller' | 'individual'>('all');
  const [userIds, setUserIds] = useState<string[]>([]);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [contentType, setContentType] = useState<'text' | 'markdown' | 'html'>('text');
  const [channel, setChannel] = useState<'in_app' | 'email' | 'sms' | 'whatsapp'>('in_app');
  const [sendEmail, setSendEmail] = useState(false);
  const [sendSms, setSendSms] = useState(false);
  const [individualLoading, setIndividualLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageError, setMessageError] = useState<string | null>(null);
  
  // State for broadcast messaging
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'buyer' | 'seller'>('all');
  const [broadcastAudience, setBroadcastAudience] = useState<'buyer' | 'seller' | undefined>(undefined);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastContentType, setBroadcastContentType] = useState<'text' | 'markdown' | 'html'>('text');
  const [broadcastChannel, setBroadcastChannel] = useState<'in_app' | 'email' | 'sms' | 'whatsapp'>('in_app');
  const [broadcastSendEmail, setBroadcastSendEmail] = useState(false);
  const [broadcastSendSms, setBroadcastSendSms] = useState(false);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [broadcastError, setBroadcastError] = useState<string | null>(null);
  
  // Config state
  const [config, setConfig] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState(true);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'send' | 'broadcast' | 'history'>('send');
  
  useEffect(() => {
    const loadInitialData = async () => {
      setConfigLoading(true);
      try {
        const configData = await getConfig();
        setConfig(configData);
      } catch (err: any) {
        console.error('Failed to load config:', err);
      } finally {
        setConfigLoading(false);
      }
      
      loadMessageHistory();
      loadBroadcastHistory();
    };
    
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen, getConfig]);
  
  const loadMessageHistory = useCallback(async () => {
    try {
      const data = await listMessages();
      if (data) {
        setMessages(data.messages || []);
      }
    } catch (err: any) {
      setMessageError(err?.message || 'Failed to load message history');
      console.error('Failed to load message history:', err);
    }
  }, [listMessages]);
  
  const loadBroadcastHistory = useCallback(async () => {
    try {
      const data = await listBroadcasts();
      if (data) {
        setBroadcasts(data.broadcasts || []);
      }
    } catch (err: any) {
      setBroadcastError(err?.message || 'Failed to load broadcast history');
      console.error('Failed to load broadcast history:', err);
    }
  }, [listBroadcasts]);
  
  const handleSendMessage = useCallback(async () => {
    if (!messageTitle.trim() || !messageContent.trim()) {
      toast.error('Title and message are required');
      return;
    }
    
    setIndividualLoading(true);
    setMessageError(null);
    try {
      const result = await sendMessage({
        target,
        title: messageTitle,
        content: messageContent,
        content_type: contentType,
        channel,
        userIds: target === 'individual' ? userIds : undefined,
        sendEmail,
        sendSms,
      });
      
      if (result?.success) {
        toast.success(`Message sent to ${result.target}`);
        setMessageTitle('');
        setMessageContent('');
        setUserIds([]);
        loadMessageHistory();
      } else {
        throw new Error(result?.error || 'Failed to send message');
      }
    } catch (err: any) {
      setMessageError(err?.message || 'Failed to send message');
      toast.error(err?.message || 'Failed to send message');
    } finally {
      setIndividualLoading(false);
    }
  }, [target, userIds, messageTitle, messageContent, contentType, channel, sendEmail, sendSms, sendMessage, loadMessageHistory]);
  
  const handleSendBroadcast = useCallback(async () => {
    if (!broadcastTitle.trim() || !broadcastContent.trim()) {
      toast.error('Title and message are required');
      return;
    }
    
    setBroadcastLoading(true);
    setBroadcastError(null);
    try {
      const result = await broadcast({
        target: broadcastTarget,
        title: broadcastTitle,
        content: broadcastContent,
        content_type: broadcastContentType,
        channel: broadcastChannel,
        audience: broadcastAudience,
        sendEmail: broadcastSendEmail,
        sendSms: broadcastSendSms,
      });
      
      if (result?.success) {
        toast.success(`Broadcast sent to ${result.target}`);
        setBroadcastTitle('');
        setBroadcastContent('');
        loadBroadcastHistory();
      } else {
        throw new Error(result?.error || 'Failed to broadcast');
      }
    } catch (err: any) {
      setBroadcastError(err?.message || 'Failed to broadcast');
      toast.error(err?.message || 'Failed to broadcast');
    } finally {
      setBroadcastLoading(false);
    }
  }, [broadcastTarget, broadcastTitle, broadcastContent, broadcastContentType, broadcastChannel, broadcastAudience, broadcastSendEmail, broadcastSendSms, broadcast, loadBroadcastHistory]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[900px] bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100 font-sans">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-white tracking-tight">Admin Communications</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('send')}
              className={activeTab === 'send' ? 'px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-emerald-500 text-white' : 'px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-slate-800 text-slate-300 hover:bg-slate-700'}
            >
              Send Message
            </button>
            <button
              onClick={() => setActiveTab('broadcast')}
              className={activeTab === 'broadcast' ? 'px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-emerald-500 text-white' : 'px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-slate-800 text-slate-300 hover:bg-slate-700'}
            >
              Broadcast
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={activeTab === 'history' ? 'px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-emerald-500 text-white' : 'px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-slate-800 text-slate-300 hover:bg-slate-700'}
            >
              History
            </button>
          </div>
        </div>
        
        {activeTab === 'send' && (
          <IndividualMessagingTab
            target={target}
            setTarget={setTarget}
            userIds={userIds}
            setUserIds={setUserIds}
            messageTitle={messageTitle}
            setMessageTitle={setMessageTitle}
            messageContent={messageContent}
            setMessageContent={setMessageContent}
            contentType={contentType}
            setContentType={setContentType}
            channel={channel}
            setChannel={setChannel}
            sendEmail={sendEmail}
            setSendEmail={setSendEmail}
            sendSms={sendSms}
            setSendSms={setSendSms}
            loading={individualLoading}
            error={messageError}
            onSend={handleSendMessage}
            config={config}
            configLoading={configLoading}
          />
        )}
        
        {activeTab === 'broadcast' && (
          <BroadcastMessagingTab
            broadcastTarget={broadcastTarget}
            setBroadcastTarget={setBroadcastTarget}
            broadcastAudience={broadcastAudience}
            setBroadcastAudience={setBroadcastAudience}
            broadcastTitle={broadcastTitle}
            setBroadcastTitle={setBroadcastTitle}
            broadcastContent={broadcastContent}
            setBroadcastContent={setBroadcastContent}
            broadcastContentType={broadcastContentType}
            setBroadcastContentType={setBroadcastContentType}
            broadcastChannel={broadcastChannel}
            setBroadcastChannel={setBroadcastChannel}
            broadcastSendEmail={broadcastSendEmail}
            setBroadcastSendEmail={setBroadcastSendEmail}
            broadcastSendSms={broadcastSendSms}
            setBroadcastSendSms={setBroadcastSendSms}
            loading={broadcastLoading}
            error={broadcastError}
            onSend={handleSendBroadcast}
            config={config}
            configLoading={configLoading}
          />
        )}
        
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-800">
                    <th className="p-3 text-left text-[10px] font-black uppercase tracking-widest">Type</th>
                    <th className="p-3 text-left text-[10px] font-black uppercase tracking-widest">Title</th>
                    <th className="p-3 text-left text-[10px] font-black uppercase tracking-widest">Target/Audience</th>
                    <th className="p-3 text-left text-[10px] font-black uppercase tracking-widest">Channel</th>
                    <th className="p-3 text-left text-[10px] font-black uppercase tracking-widest">Sent</th>
                    <th className="p-3 text-left text-[10px] font-black uppercase tracking-widest">Status</th>
                    <th className="p-3 text-left text-[10px] font-black uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...messages.slice(0, 5), ...broadcasts.slice(0, 5)].sort((a, b) => 
                    new Date(b.created_at || b.sent_at || 0).getTime() - new Date(a.created_at || a.sent_at || 0).getTime()
                  ).map((item, index) => (
                    <tr key={index} className="border-t border-slate-800">
                      <td className="p-3 text-[10px]">{item.content_type || 'text'}</td>
                      <td className="p-3 text-[10px] truncate max-w-[150px]">{item.title || 'No title'}</td>
                      <td className="p-3 text-[10px] truncate max-w-[120px]">
                        {item.target ? (
                          item.target === 'individual' ? `Individual (${item.userIds?.length || 0} users)` : item.target
                        ) : item.audience || 'all'}
                      </td>
                      <td className="p-3 text-[10px]">{item.channel || 'in_app'}</td>
                      <td className="p-3 text-[10px]">{item.sent_count || (item.success ? 1 : 0)}</td>
                      <td className="p-3 text-[10px]">{item.status || (item.success ? 'sent' : 'failed')}</td>
                      <td className="p-3 text-[10px] flex space-x-2">
                        <button
                          onClick={() => toast.success('View details (coming soon)')}
                          className="p-1 text-xs bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded"
                        >
                          <Info className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[9px] text-slate-500 text-center">
              Showing recent communications. Full history view coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const IndividualMessagingTab: React.FC<{
  target: 'all' | 'buyer' | 'seller' | 'individual';
  setTarget: React.Dispatch<React.SetStateAction<'all' | 'buyer' | 'seller' | 'individual'>>;
  userIds: string[];
  setUserIds: React.Dispatch<React.SetStateAction<string[]>>;
  messageTitle: string;
  setMessageTitle: React.Dispatch<React.SetStateAction<string>>;
  messageContent: string;
  setMessageContent: React.Dispatch<React.SetStateAction<string>>;
  contentType: 'text' | 'markdown' | 'html';
  setContentType: React.Dispatch<React.SetStateAction<'text' | 'markdown' | 'html'>>;
  channel: 'in_app' | 'email' | 'sms' | 'whatsapp';
  setChannel: React.Dispatch<React.SetStateAction<'in_app' | 'email' | 'sms' | 'whatsapp'>>;
  sendEmail: boolean;
  setSendEmail: React.Dispatch<React.SetStateAction<boolean>>;
  sendSms: boolean;
  setSendSms: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  error: string | null;
  onSend: () => Promise<void>;
  config: any;
  configLoading: boolean;
}> = ({
  target,
  setTarget,
  userIds,
  setUserIds,
  messageTitle,
  setMessageTitle,
  messageContent,
  setMessageContent,
  contentType,
  setContentType,
  channel,
  setChannel,
  sendEmail,
  setSendEmail,
  sendSms,
  setSendSms,
  loading,
  error,
  onSend,
  config,
  configLoading,
}) => {
  const handleUserIdsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ids = e.target.value
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);
    setUserIds(ids);
  };
  
  return (
    <div className="space-y-4">
      <div className="border border-slate-700 rounded-xl p-4 bg-slate-950">
        <div className="flex items-center gap-3 mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <p className="text-[10px] text-emerald-300 font-semibold leading-tight">
            Send individual message
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTarget('all')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${target === 'all' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                All
              </button>
              <button
                onClick={() => setTarget('buyer')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${target === 'buyer' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                Buyers
              </button>
              <button
                onClick={() => setTarget('seller')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${target === 'seller' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                Sellers
              </button>
              <button
                onClick={() => setTarget('individual')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${target === 'individual' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                Individual
              </button>
            </div>
            {target === 'individual' && (
              <div className="mt-2">
                <label className="text-[9px] text-slate-500 block mb-1">User IDs (comma-separated)</label>
                <input
                  type="text"
                  value={userIds.join(', ')}
                  onChange={handleUserIdsChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="user1-id, user2-id, user3-id"
                />
                {userIds.length > 0 && (
                  <p className="mt-1 text-[9px] text-emerald-400">{userIds.length} user(s) selected</p>
                )}
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Title *</label>
            <input
              type="text"
              value={messageTitle}
              onChange={(e) => setMessageTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              placeholder="Enter message title"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Message *</label>
            <RichTextEditor
              value={messageContent}
              onChange={setMessageContent}
              placeholder="Type your message here..."
              maxLength={10000}
              className="h-[200px]"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Content Type</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setContentType('text')}
                  className={`px-2 py-0.5 rounded-xs text-xs ${contentType === 'text' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  Text
                </button>
                <button
                  onClick={() => setContentType('markdown')}
                  className={`px-2 py-0.5 rounded-xs text-xs ${contentType === 'markdown' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  Markdown
                </button>
                <button
                  onClick={() => setContentType('html')}
                  className={`px-2 py-0.5 rounded-xs text-xs ${contentType === 'html' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  HTML
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Channel</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setChannel('in_app')}
                  className={`px-2 py-0.5 rounded-xs text-xs ${channel === 'in_app' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  In-App
                </button>
                <button
                  onClick={() => setChannel('email')}
                  className={`px-2 py-0.5 rounded-xs text-xs ${channel === 'email' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  Email
                </button>
                <button
                  onClick={() => setChannel('sms')}
                  className={`px-2 py-0.5 rounded-xs text-xs ${channel === 'sms' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  SMS
                </button>
                <button
                  onClick={() => setChannel('whatsapp')}
                  className={`px-2 py-0.5 rounded-xs text-xs ${channel === 'whatsapp' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  WhatsApp
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Additional Channels</label>
              <div className="flex items-start space-x-3">
                <label className="flex items-center gap-2 text-[9px] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="h-3 w-3 text-emerald-600 bg-slate-900 border-emerald-300 rounded"
                  />
                  Send Email
                </label>
                <label className="flex items-center gap-2 text-[9px] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendSms}
                    onChange={(e) => setSendSms(e.target.checked)}
                    className="h-3 w-3 text-emerald-600 bg-slate-900 border-emerald-300 rounded"
                  />
                  Send SMS
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <p className="text-[10px] text-red-300 font-semibold leading-tight">{error}</p>
          </div>
        )}
        
        <button
          onClick={onSend}
          disabled={loading || !messageTitle.trim() || !messageContent.trim()}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg mt-4 transition-all disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </div>
      
      {!configLoading && config && (
        <div className="border border-slate-700 rounded-xl p-4 bg-slate-950 mt-4">
          <div className="flex items-center gap-3 mb-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
            <AlertCircle className="w-4 h-4 text-emerald-400" />
            <p className="text-[10px] text-emerald-300 font-semibold leading-tight">Delivery Configuration</p>
          </div>
          <div className="space-y-2 text-[9px] text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex-1">Email:</span>
              <span>{config.email?.configured ? '✓ Configured' : '✗ Not configured'}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex-1">SMS:</span>
              <span>{config.sms?.configured ? '✓ Configured' : '✗ Not configured'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BroadcastMessagingTab: React.FC<{
  broadcastTarget: 'all' | 'buyer' | 'seller';
  setBroadcastTarget: React.Dispatch<React.SetStateAction<'all' | 'buyer' | 'seller'>>;
  broadcastAudience: 'buyer' | 'seller' | undefined;
  setBroadcastAudience: React.Dispatch<React.SetStateAction<'buyer' | 'seller' | undefined>>;
  broadcastTitle: string;
  setBroadcastTitle: React.Dispatch<React.SetStateAction<string>>;
  broadcastContent: string;
  setBroadcastContent: React.Dispatch<React.SetStateAction<string>>;
  broadcastContentType: 'text' | 'markdown' | 'html';
  setBroadcastContentType: React.Dispatch<React.SetStateAction<'text' | 'markdown' | 'html'>>;
  broadcastChannel: 'in_app' | 'email' | 'sms' | 'whatsapp';
  setBroadcastChannel: React.Dispatch<React.SetStateAction<'in_app' | 'email' | 'sms' | 'whatsapp'>>;
  broadcastSendEmail: boolean;
  setBroadcastSendEmail: React.Dispatch<React.SetStateAction<boolean>>;
  broadcastSendSms: boolean;
  setBroadcastSendSms: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  error: string | null;
  onSend: () => Promise<void>;
  config: any;
  configLoading: boolean;
}> = ({
  broadcastTarget,
  setBroadcastTarget,
  broadcastAudience,
  setBroadcastAudience,
  broadcastTitle,
  setBroadcastTitle,
  broadcastContent,
  setBroadcastContent,
  broadcastContentType,
  setBroadcastContentType,
  broadcastChannel,
  setBroadcastChannel,
  broadcastSendEmail,
  setBroadcastSendEmail,
  broadcastSendSms,
  setBroadcastSendSms,
  loading,
  error,
  onSend,
  config,
  configLoading,
}) => {
  return (
    <div className="space-y-4">
      <div className="border border-slate-700 rounded-xl p-4 bg-slate-950">
        <div className="flex items-center gap-3 mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
          <Send className="w-4 h-4 text-emerald-400" />
          <p className="text-[10px] text-emerald-300 font-semibold leading-tight">
            Broadcast Message
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBroadcastTarget('all')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${broadcastTarget === 'all' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                All Users
              </button>
              <button
                onClick={() => setBroadcastTarget('buyer')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${broadcastTarget === 'buyer' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                Buyers Only
              </button>
              <button
                onClick={() => setBroadcastTarget('seller')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${broadcastTarget === 'seller' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                Sellers Only
              </button>
            </div>
            {broadcastTarget !== 'all' && (
              <div className="mt-2">
                <label className="text-[9px] text-slate-500 block mb-1">Audience (for role-based targeting)</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setBroadcastAudience('buyer')}
                    className={`px-2 py-0.5 rounded-xs text-xs ${broadcastAudience === 'buyer' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    Buyers
                  </button>
                  <button
                    onClick={() => setBroadcastAudience('seller')}
                    className={`px-2 py-0.5 rounded-xs text-xs ${broadcastAudience === 'seller' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    Sellers
                  </button>
                  <button
                    onClick={() => setBroadcastAudience(undefined)}
                    className={`px-2 py-0.5 rounded-xs text-xs ${broadcastAudience === undefined ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    None
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Title *</label>
            <input
              type="text"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              placeholder="Enter broadcast title"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Message *</label>
            <RichTextEditor
              value={broadcastContent}
              onChange={setBroadcastContent}
              placeholder="Type your broadcast message here..."
              maxLength={10000}
              className="h-[200px]"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Content Type</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setBroadcastContentType('text')}
                  className={`px-2 py-0.5 rounded-xs text-xs ${broadcastContentType === 'text' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  Text
                </button>
                <button
                  onClick={() => setBroadcastContentType('markdown')}
                  className={`px-2 py-0.5 rounded-xs text-xs ${broadcastContentType === 'markdown' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  Markdown
                </button>
                <button
                  onClick={() => setBroadcastContentType('html')}
                  className={`px-2 py-0.5 rounded-xs text-xs ${broadcastContentType === 'html' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  HTML
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Channel</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setBroadcastChannel('in_app')}
                  className={`px-2 py-0.5 rounded-xs text-xs ${broadcastChannel === 'in_app' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  In-App
                </button>
                <button
                  onClick={() => setBroadcastChannel('email')}
                  className={`px-2 py-0.5 rounded-xs text-xs ${broadcastChannel === 'email' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  Email
                </button>
                <button
                  onClick={() => setBroadcastChannel('sms')}
                  className={`px-2 py-0.5 rounded-xs text-xs ${broadcastChannel === 'sms' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  SMS
                </button>
                <button
                  onClick={() => setBroadcastChannel('whatsapp')}
                  className={`px-2 py-0.5 rounded-xs text-xs ${broadcastChannel === 'whatsapp' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  WhatsApp
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Additional Channels</label>
              <div className="flex items-start space-x-3">
                <label className="flex items-center gap-2 text-[9px] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={broadcastSendEmail}
                    onChange={(e) => setBroadcastSendEmail(e.target.checked)}
                    className="h-3 w-3 text-emerald-600 bg-slate-900 border-emerald-300 rounded"
                  />
                  Send Email
                </label>
                <label className="flex items-center gap-2 text-[9px] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={broadcastSendSms}
                    onChange={(e) => setBroadcastSendSms(e.target.checked)}
                    className="h-3 w-3 text-emerald-600 bg-slate-900 border-emerald-300 rounded"
                  />
                  Send SMS
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <p className="text-[10px] text-red-300 font-semibold leading-tight">{error}</p>
          </div>
        )}
        
        <button
          onClick={onSend}
          disabled={loading || !broadcastTitle.trim() || !broadcastContent.trim()}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-lg mt-4 transition-all disabled:opacity-50"
        >
          {loading ? 'Broadcasting...' : 'Send Broadcast'}
        </button>
      </div>
      
      {!configLoading && config && (
        <div className="border border-slate-700 rounded-xl p-4 bg-slate-950 mt-4">
          <div className="flex items-center gap-3 mb-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
            <AlertCircle className="w-4 h-4 text-emerald-400" />
            <p className="text-[10px] text-emerald-300 font-semibold leading-tight">Delivery Configuration</p>
          </div>
          <div className="space-y-2 text-[9px] text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex-1">Email:</span>
              <span>{config.email?.configured ? '✓ Configured' : '✗ Not configured'}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex-1">SMS:</span>
              <span>{config.sms?.configured ? '✓ Configured' : '✗ Not configured'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};