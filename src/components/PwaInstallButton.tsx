import React, { useState } from 'react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { 
  Download, 
  CheckCircle2, 
  Smartphone, 
  Share, 
  PlusSquare, 
  AlertTriangle,
  X,
  Compass,
  ExternalLink
} from 'lucide-react';
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
  const { isInstallable, isInstalled, isIos, isSafari, install } = usePwaInstall();
  const [showIosModal, setShowIosModal] = useState(false);

  const handleInstallClick = async () => {
    if (isInstalled) {
      toast.info('Sealify is already installed on your home screen!');
      return;
    }

    if (isIos) {
      setShowIosModal(true);
      return;
    }

    if (isInstallable) {
      const success = await install();
      if (success) {
        toast.success('🎉 Sealify added to home screen!');
        if (onInstalled) onInstalled();
      }
    } else {
      // Generic fallback for desktop or other mobile browsers
      toast.info('To install: Tap your browser settings (three dots/lines) and select "Add to Home Screen".', {
        duration: 5000
      });
    }
  };

  if (isInstalled) {
    return (
      <div className={`p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center gap-2 text-xs font-black text-emerald-400 ${className}`}>
        <CheckCircle2 className="w-4 h-4" />
        <span>Sealify App Active</span>
      </div>
    );
  }

  const buttonContent = (
    <>
      <Download className="w-4 h-4" />
      <span>Install Sealify App</span>
    </>
  );

  if (variant === 'compact') {
    return (
      <button
        onClick={handleInstallClick}
        className={`px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95 ${className}`}
      >
        {buttonContent}
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
            <h3 className="text-lg font-black text-white">Install Sealify Native App</h3>
            <p className="text-xs text-slate-400">Launch faster and get instant deal notifications</p>
          </div>
        </div>

        <button
          onClick={handleInstallClick}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <Download className="w-5 h-5" />
          <span>INSTALL APP NOW</span>
        </button>
      </div>

      {/* iPhone / iPad Instructions Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowIosModal(false)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {!isSafari ? (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white">Switch to Safari</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  iOS installation is only supported in the <strong>Safari browser</strong>. Please copy the URL and open it in Safari to add Sealify to your home screen.
                </p>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[10px] text-emerald-400 break-all">
                  {window.location.href}
                </div>
              </div>
            ) : (
              <>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                    <Share className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-white">Install on iPhone</h3>
                  <p className="text-xs text-slate-400">Complete these 2 steps in Safari:</p>
                </div>

                <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                  <div className="flex items-start gap-4 p-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0">1</div>
                    <div>
                      <p className="font-bold text-white flex items-center gap-2">
                        Tap the Share Icon <Share className="w-4 h-4 text-emerald-400" />
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Found at the bottom center of your browser.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0">2</div>
                    <div>
                      <p className="font-bold text-white flex items-center gap-2">
                        Select "Add to Home Screen" <PlusSquare className="w-4 h-4 text-emerald-400" />
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Scroll down in the menu and tap it to install.</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <button
              onClick={() => setShowIosModal(false)}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg"
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