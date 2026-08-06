import React, { useState, useEffect } from 'react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { Download, X, CheckCircle2, Smartphone, AlertCircle, Globe, Wifi, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface PwaInstallPromptProps {
  variant?: 'banner' | 'modal' | 'card';
  className?: string;
  onInstalled?: () => void;
  apkDownloadUrl?: string;
}

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({
  variant = 'banner',
  className = '',
  onInstalled,
  apkDownloadUrl = '/sealify-app.apk'
}) => {
  const { isInstallable, isInstalled, isIos, isAndroid, isSafari, install } = usePwaInstall();
  const [showModal, setShowModal] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [showAndroidModal, setShowAndroidModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isDownloadingApk, setIsDownloadingApk] = useState(false);

  // Auto-show modal on first visit for mobile users
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isInstallable && !isInstalled && !dismissed && isMobile) {
      const timer = setTimeout(() => {
        if (isIos || isSafari) {
          setShowIosModal(true);
        } else if (isAndroid) {
          setShowAndroidModal(true);
        } else {
          setShowModal(true);
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, isIos, isSafari, isAndroid]);

  if (isInstalled) return null;

  const handleInstallClick = () => {
    if (isIos || isSafari) {
      setShowIosModal(true);
    } else if (isAndroid) {
      setShowAndroidModal(true);
    } else {
      setShowModal(true);
    }
  };

  const handleNativeInstall = async () => {
    if (!isInstallable) {
      toast.error('Native install not available. Try the manual method.');
      return;
    }

    const success = await install();
    if (success) {
      toast.success('🎉 Sealify installed successfully on your home screen!');
      if (onInstalled) onInstalled();
      setShowAndroidModal(false);
    } else {
      toast.error('Installation cancelled or failed.');
    }
  };

  const handleApkDownload = () => {
    setIsDownloadingApk(true);
    const link = document.createElement('a');
    link.href = apkDownloadUrl;
    link.download = 'sealify-app.apk';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('APK download started! Open the file to install.', { duration: 5000 });
    setShowAndroidModal(false);
    setTimeout(() => setIsDownloadingApk(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    toast.success('Link copied! Open Safari on your iPhone and paste the URL.');
    setTimeout(() => setCopiedUrl(false), 3000);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_install_dismissed', 'true');
    setShowModal(false);
    setShowIosModal(false);
    setShowAndroidModal(false);
  };

  if (variant === 'banner' && isInstallable && !isInstalled) {
    return (
      <div className={`fixed bottom-4 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:w-96 z-50 animate-in slide-in-from-bottom-4 ${className}`}>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Install Sealify App</p>
              <p className="text-xs text-slate-400">Faster access, offline mode & push alerts</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition-transform active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
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
    );
  }

  return (
    <>
      {handleInstallClick() && null}
      
      {/* iOS / Safari Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowIosModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/30">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">Install on iPhone / iPad</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                iOS requires <strong className="text-blue-400">Safari browser</strong> to add Web Apps to your home screen.
              </p>
            </div>

            {!isSafari ? (
              <div className="space-y-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-xs font-medium">You appear to be using an in-app browser (Instagram, WhatsApp, Telegram, etc.).</p>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Please tap the menu (<MoreVertical className="w-3.5 h-3.5 inline" />) and select <strong>"Open in Safari"</strong> or <strong>"Open in Browser"</strong>, then follow the steps below.
                </p>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Website Address</p>
                  <p className="font-mono text-xs text-emerald-400 break-all">{window.location.href}</p>
                  <button
                    onClick={handleCopyUrl}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                  >
                    {copiedUrl ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Globe className="w-4 h-4" />}
                    <span>{copiedUrl ? 'Copied to Clipboard!' : 'Copy Link for Safari'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                  <div className="flex items-start gap-3.5 p-2">
                    <div className="w-7 h-7 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black shrink-0 text-sm">
                      1
                    </div>
                    <div>
                      <p className="font-bold text-white flex items-center gap-1.5">
                        Tap the Share Button <Wifi className="w-4 h-4 text-blue-400 inline" />
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">At the bottom center of Safari browser (square with arrow up).</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-2">
                    <div className="w-7 h-7 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black shrink-0 text-sm">
                      2
                    </div>
                    <div>
                      <p className="font-bold text-white flex items-center gap-1.5">
                        Select "Add to Home Screen" <Settings className="w-4 h-4 text-blue-400 inline" />
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Scroll down in the option list and tap Add.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 text-sm">
                      3
                    </div>
                    <div>
                      <p className="font-bold text-white">Tap "Add" in the top right</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Sealify will appear on your home screen like a native app.</p>
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

      {/* Android Modal - Two Options */}
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
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">Install on Android</h3>
              <p className="text-xs text-slate-400">Choose your preferred installation method</p>
            </div>

            <div className="space-y-3">
              {/* Option A: Native PWA Install */}
              <button
                onClick={handleNativeInstall}
                disabled={!isInstallable}
                className="w-full p-4 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-2xl text-left transition-all flex items-center gap-4 group"
              >
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0">
                  <Wifi className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">Option A: Web App (PWA)</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Instant install via browser • No download • Auto-updates • Works offline</p>
                </div>
                <div className={`text-[10px] font-bold shrink-0 ${isInstallable ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {isInstallable ? 'Available' : 'Unavailable'}
                </div>
              </button>

              {/* Option B: APK Download */}
              <button
                onClick={handleApkDownload}
                disabled={isDownloadingApk}
                className="w-full p-4 bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-2xl text-left transition-all flex items-center gap-4 group"
              >
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/30 shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white group-hover:text-blue-400 transition-colors">Option B: Direct APK Download</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Download .apk file • Install manually • Full native access • Requires "Unknown Sources" enabled</p>
                </div>
                <div className="text-[10px] font-bold text-blue-400 shrink-0">
                  {isDownloadingApk ? 'Downloading...' : 'Download'}
                </div>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800 p-3 bg-slate-950 rounded-2xl space-y-2 text-[11px] text-slate-400">
              <p className="font-bold text-slate-300">After APK download:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open <strong>Files</strong> or <strong>Downloads</strong> app</li>
                <li>Tap <strong>sealify-app.apk</strong></li>
                <li>If prompted, enable <strong>"Install from Unknown Sources"</strong> for your browser/files app</li>
                <li>Tap <strong>Install</strong> → <strong>Open</strong></li>
              </ol>
            </div>

            <button
              onClick={() => setShowAndroidModal(false)}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Desktop / General Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">Install Sealify</h3>
              <p className="text-xs text-slate-400">Add to your device for faster access and notifications</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCopyUrl}
                className="w-full p-4 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-2xl text-left transition-all flex items-center gap-4"
              >
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white">Copy Website Link</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Paste into your mobile browser to install from there</p>
                </div>
              </button>

              <a
                href={apkDownloadUrl}
                download="sealify-app.apk"
                className="w-full p-4 bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-2xl text-left transition-all flex items-center gap-4"
              >
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/30 shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white">Download Android APK</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Direct .apk file for manual installation on Android</p>
                </div>
              </a>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PwaInstallPrompt;