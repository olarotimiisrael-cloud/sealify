import { useState, useEffect } from 'react';

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone display mode
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      return !!isStandaloneMode;
    };

    setIsInstalled(checkStandalone());

    const ua = (window.navigator.userAgent || '').toLowerCase();
    
    // iOS detection (iPhone, iPad, iPod, including iPadOS)
    const isIosDevice = /iphone|ipad|ipod/.test(ua) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIos(!!isIosDevice);

    // Android detection
    const isAndroidDevice = /android/.test(ua);
    setIsAndroid(!!isAndroidDevice);

    // iOS Safari detection
    const isSafariBrowser = /safari/.test(ua) && !/chrome|crios|crmo|firefox|fxios|edge|edgios|opera|opr/.test(ua);
    setIsSafari(!!isSafariBrowser);

    // Global listener for beforeinstallprompt event (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
    } catch (e) {
      console.error('PWA installation prompt failed:', e);
    }

    return false;
  };

  return {
    isInstallable,
    isInstalled,
    isIos,
    isAndroid,
    isSafari,
    install
  };
}