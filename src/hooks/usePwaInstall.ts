import { useState, useEffect } from 'react';

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false); // ADDED MISSING STATE
  const [isSafari, setIsSafari] = useState(false);
  const [promptEvent, setPromptEvent] = useState<any>(null);

  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true || 
        document.referrer.includes('android-app://');
      return !!isStandaloneMode;
    };

    setIsInstalled(checkStandalone());

    const ua = (window.navigator.userAgent || '').toLowerCase();
    
    const isIosDevice = /iphone|ipad|ipod/.test(ua) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIos(!!isIosDevice);

    const isAndroidDevice = /android/.test(ua);
    setIsAndroid(!!isAndroidDevice); // USED CORRECT SETTER

    const isSafariBrowser = /safari/.test(ua) && !/chrome|crios|crmo|firefox|fxios|edge|edgios|opera|opr/.test(ua);
    setIsSafari(!!isSafariBrowser);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      setPromptEvent(e);
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
      if (isIos || isSafari) {
        return false;
      }

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
    install,
    promptEvent
  };
}