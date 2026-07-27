import React, { useState } from 'react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { 
  Download, 
  CheckCircle2, 
  Smartphone, 
  Share, 
  PlusSquare, 
  X,
  Compass,
  MoreVertical,
  Copy,
  Check
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
  const [showAndroidModal, setShowAndroidModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleInstallClick = async () => {
    if (isInstalled) {
      toast.info('Sealify is already installed on your home screen!');
      return;
    }

    // iPhone / iPad Flow
    if (isIos) {
      setShowIosModal(true);
      return;
    }

    // Native Browser Prompt Flow (Android / Chrome / Edge)
    if (isInstallable) {
      const success = await install();
      if (success) {
        toast.success('🎉 Sealify installed successfully on your home screen!');
        if (onInstalled) onInstalled();
        return;
      }
    }

    // Fallback Manual Guide Flow for Android/Desktop when beforeinstallprompt isn't available
    setShowAndroidModal(true);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    toast.success('Link copied! Open Safari on your iPhone and paste the URL.');
    setTimeout(() => setCopiedUrl(false), 3000);
  };

  if (isInstalled) {
    return (
      <div className={`p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center gap-2 text-xs font-black text-emerald-400 ${className}`}>
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span>Sealify App Active</span>
      </div>
    );
  }

  const buttonLabel = (
    <span className="flex items-center gap-2">
      <Download className="w-4 h-4 shrink-0" />
      <span>Install App</span>
    </span>
  );

  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className={`px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95 ${className}`}
        >
          {buttonLabel}
        </button>

        {renderModals()}
      </>
    );
  }

  function renderModals() {
    return (
      <>
        {/* iPhone / iPad Guided Modal */}
        {showIosModal && (
          <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowIosModal(false)}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {!isSafari ? (
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white">Open in Safari Browser</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      iOS requires the <strong>Safari browser</strong> to install Web Apps to your home screen.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Website Address</p>
                    <p className="font-mono text-xs text-emerald-400 break-all">{window.location.href}</p>
                    <button
                      onClick={handleCopyUrl}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                    >
                      {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedUrl ? 'Copied to Clipboard!' : 'Copy Link for Safari'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                      <Share className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-white">Install on iPhone</h3>
                    <p className="text-xs text-slate-400">Add Sealify to your home screen in 2 taps:</p>
                  </div>

                  <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                    <div className="flex items-start gap-3.5 p-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 text-sm">
                        1
                      </div>
                      <div>
                        <p className="font-bold text-white flex items-center gap-1.5">
                          Tap the Share Button <Share className="w-4 h-4 text-emerald-400 inline" />
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">At the bottom center of Safari browser.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 p-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 text-sm">
                        2
                      </div>
                      <div>
                        <p className="font-bold text-white flex items-center gap-1.5">
                          Select "Add to Home Screen" <PlusSquare className="w-4 h-4 text-emerald-400 inline" />
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Scroll down in the option list and tap Add.</p>
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

        {/* Android / General Browser Instructions Modal */}
        {showAndroidModal && (
          <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowAndroidModal(false)}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                  <MoreVertical className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white">Install App on Android</h3>
                <p className="text-xs text-slate-400">Add Sealify to your phone in 2 simple steps:</p>
              </div>

              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                <div className="flex items-start gap-3.5 p-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 text-sm">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-white flex items-center gap-1.5">
                      Tap Menu (3 Dots) <MoreVertical className="w-4 h-4 text-emerald-400 inline" />
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Located at the top right of Chrome/Edge browser.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 text-sm">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-white flex items-center gap-1.5">
                      Tap "Install App" or "Add to Home Screen"
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Confirm to launch Sealify natively on your phone.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowAndroidModal(false)}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
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
            <p className="text-xs text-slate-400">Launch faster and receive instant deal alerts</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          Enjoy faster page speeds, offline accessibility, and instant push notifications for buyer inquiries across Ogbomoso & Oyo State.
        </p>

        <button
          onClick={handleInstallClick}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <Download className="w-5 h-5" />
          <span>INSTALL SEALIFY APP NOW</span>
        </button>
      </div>

      {renderModals()}
    </>
  );
};

export default PwaInstallButton;