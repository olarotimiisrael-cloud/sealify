import React, { useState, useEffect } from 'react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { Download, X, CheckCircle2, Smartphone, Share, PlusSquare, 
  Compass,
  MoreVertical,
  Copy,
  Check,
  AlertCircle,
  Globe,
  Wifi,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface PwaInstallPromptProps {
  variant?: 'primary' | 'card' | 'compact';
  className?: string;
  onInstalled?: () => void;
  apkDownloadUrl?: string;
}

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({
  variant = 'card',
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

  // Auto-detect and show appropriate modal on button click
  const handleInstallClick = () => {
    if (isInstalled) {
      toast.info('Sealify is already installed on your home screen!');
      return;
    }

    if (isIos || isSafari) {
      setShowIosModal(true);
    } else if (isAndroid) {
      setShowAndroidModal(true);
    } else {
      // Desktop or unknown - show general modal
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

  if (isInstalled) {
    return (
      <div className={`p-3.5 bg-emerald-50 border border-emerald-500/30 rounded-2xl flex items-center justify-center gap-2 text-xs font-black text-emerald-600 ${className}`}>
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
        {/* iOS / Safari Modal */}
        {showIosModal && (
          <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-900 space-y-5 animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowIosModal(false)}
                className="absolute top-5 right-5 p-1.5 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/30">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Install on iPhone / iPad</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  iOS requires <strong className="text-blue-400">Safari browser</strong> to add Web Apps to your home screen.
                </p>
              </div>

              {!isSafari ? (
                <div className="space-y-4 p-4 bg-white border border-slate-200 rounded-2xl">
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-xs font-medium">You appear to be using an in-app browser (Instagram, WhatsApp, Telegram, etc.).</p>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Please tap the menu (<MoreVertical className="w-3.5 h-3.5 inline" />) and select <strong>"Open in Safari"</strong> or <strong>"Open in Browser"</strong>, then follow the steps below.
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                    <p className="text-[10px] text-slate-600 font-bold uppercase">Website Address</p>
                    <p className="font-mono text-xs text-emerald-600 break-all">{window.location.href}</p>
                    <button
                      onClick={handleCopyUrl}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-750 text-slate-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                    >
                      {copiedUrl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedUrl ? 'Copied to Clipboard!' : 'Copy Link for Safari'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 text-xs">
                    <div className="flex items-start gap-3.5 p-2">
                      <div className="w-7 h-7 rounded-xl bg-blue-500 text-slate-900 flex items-center justify-center font-black shrink-0 text-sm">
                        1
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                          Tap the Share Button <Share className="w-4 h-4 text-blue-400 inline" />
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5">At the bottom center of Safari browser (square with arrow up).</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 p-2">
                      <div className="w-7 h-7 rounded-xl bg-blue-500 text-slate-900 flex items-center justify-center font-black shrink-0 text-sm">
                        2
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                          Select "Add to Home Screen" <PlusSquare className="w-4 h-4 text-blue-400 inline" />
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5">Scroll down in the option list and tap Add.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 p-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 text-sm">
                        3
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Tap "Add" in the top right</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">Sealify will appear on your home screen like a native app.</p>
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
          <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-900 space-y-5 animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowAndroidModal(false)}
                className="absolute top-5 right-5 p-1.5 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Install on Android</h3>
                <p className="text-xs text-slate-600">Choose your preferred installation method</p>
              </div>

              <div className="space-y-3">
                {/* Option A: Native PWA Install */}
                <button
                  onClick={handleNativeInstall}
                  disabled={!isInstallable}
                  className="w-full p-4 bg-white border border-slate-200 hover:border-emerald-500/50 rounded-2xl text-left transition-all flex items-center gap-4 group"
                >
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-500/30 shrink-0">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Option A: Web App (PWA)</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">Instant install via browser • No download • Auto-updates • Works offline</p>
                  </div>
                  <div className={`text-[10px] font-bold shrink-0 ${isInstallable ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {isInstallable ? 'Available' : 'Unavailable'}
                  </div>
                </button>

                {/* Option B: APK Download */}
                <button
                  onClick={handleApkDownload}
                  disabled={isDownloadingApk}
                  className="w-full p-4 bg-white border border-slate-200 hover:border-blue-500/50 rounded-2xl text-left transition-all flex items-center gap-4 group"
                >
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/30 shrink-0">
                    <Download className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 group-hover:text-blue-400 transition-colors">Option B: Direct APK Download</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">Download .apk file • Install manually • Full native access • Requires "Unknown Sources" enabled</p>
                  </div>
                  <div className="text-[10px] font-bold text-blue-400 shrink-0">
                    {isDownloadingApk ? 'Downloading...' : 'Download'}
                  </div>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-200 p-3 bg-white rounded-2xl space-y-2 text-[11px] text-slate-600">
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
                className="w-full py-3.5 bg-slate-100 hover:bg-slate-750 text-slate-200 font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Desktop / General Modal */}
        {showModal && (
          <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-slate-900 space-y-5 animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-5 right-5 p-1.5 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Install Sealify</h3>
                <p className="text-xs text-slate-600">Add to your device for faster access and notifications</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCopyUrl}
                  className="w-full p-4 bg-white border border-slate-200 hover:border-emerald-500/50 rounded-2xl text-left transition-all flex items-center gap-4"
                >
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-500/30 shrink-0">
                    <Copy className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Copy Website Link</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">Paste into your mobile browser to install from there</p>
                  </div>
                </button>

                <a
                  href={apkDownloadUrl}
                  download="sealify-app.apk"
                  className="w-full p-4 bg-white border border-slate-200 hover:border-blue-500/50 rounded-2xl text-left transition-all flex items-center gap-4"
                >
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/30 shrink-0">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Download Android APK</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">Direct .apk file for manual installation on Android</p>
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
  }

  return (
    <>
      <div className={`bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl space-y-4 relative overflow-hidden ${className}`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl border border-emerald-500/30 shrink-0">
            <Smartphone className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Install Sealify Native App</h3>
            <p className="text-xs text-slate-600">Launch faster and receive instant deal alerts</p>
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

export default PwaInstallPrompt;

