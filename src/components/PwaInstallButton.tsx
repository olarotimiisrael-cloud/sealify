import React, { useState } from 'react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { Download, CheckCircle2, Smartphone, Share, PlusSquare, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';

interface PwaInstallButtonProps {
  variant?: 'primary' | 'card' | 'compact';
  className?: string;
  onInstalled?: () => void;
}

export const PwaInstallButton: React.FC<PwaInstallButtonProps> = ({
  variant = 'card',
  className = '',
  onInstalled
}) => {
  const { isInstallable, isInstalled, isIos, install } = usePwaInstall();
  const [showIosModal, setShowIosModal] = useState(false);

  const handleInstallClick = async () => {
    if (isInstalled) {
      toast.info('Sealify is already installed on this device!');
      return;
    }

    if (isIos) {
      setShowIosModal(true);
      return;
    }

    if (isInstallable) {
      const success = await install();
      if (success) {
        toast.success('🎉 Sealify installed successfully on your home screen!');
        if (onInstalled) onInstalled();
      }
    } else {
      // Fallback instructions for desktop or unsupported browsers
      toast.info('To install Sealify: Tap your browser menu (⋮) and select "Add to Home Screen" or "Install App".');
    }
  };

  if (isInstalled) {
    return (
      <div className={`p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center gap-2 text-xs font-black text-emerald-400 ${className}`}>
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span>Sealify App Installed & Active</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleInstallClick}
        className={`px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95 ${className}`}
      >
        <Download className="w-4 h-4" />
        <span>Install App</span>
      </button>
    );
  }

  return (
    <>
      <div className={`bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl space-y-4 relative overflow-hidden ${className}`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shrink-0">
            <Smartphone className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">Install Sealify Native App</h3>
              <span className="text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                PWA Fast Launch
              </span>
            </div>
            <p className="text-xs text-slate-400">Add Sealify to your mobile home screen for instant 1-tap access</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          Enjoy faster page load speeds, offline resilience, and instant push notifications for buyer inquiries across Ogbomoso & Oyo State.
        </p>

        <button
          onClick={handleInstallClick}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <Download className="w-5 h-5" />
          <span>INSTALL SEALIFY APP NOW</span>
        </button>
      </div>

      {/* iOS Instructions Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-slate-100 space-y-5">
            <button
              onClick={() => setShowIosModal(false)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                <Share className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">Install on iPhone / iPad</h3>
              <p className="text-xs text-slate-400">Follow these 2 simple steps in Safari:</p>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shrink-0">1</div>
                <div>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    Tap the Share Icon <Share className="w-4 h-4 text-emerald-400 inline" />
                  </p>
                  <p className="text-[11px] text-slate-400">Located at the bottom center of your Safari browser bar.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shrink-0">2</div>
                <div>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    Select "Add to Home Screen" <PlusSquare className="w-4 h-4 text-emerald-400 inline" />
                  </p>
                  <p className="text-[11px] text-slate-400">Scroll down in the share menu and tap Add to Home Screen.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosModal(false)}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PwaInstallButton;