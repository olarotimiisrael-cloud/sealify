import { useState, useEffect } from 'react';

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone display mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    // Detect iOS devices (iPhone, iPad, iPod)
    // Some newer iPads identify as 'MacIntel' but have touch points
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    setIsIos(!!isIosDevice && !isStandalone);

    // Detect if the browser is Safari (required for iOS installation)
    const isSafariBrowser = /safari/.test(userAgent) && !/chrome|crios|crmo|firefox|fxios|edge|edgios|opera|opr|opr\/|opr\\/.test(userAgent);
    setIsSafari(isSafariBrowser);

    // Global listener for beforeinstallprompt event (Android/Chrome/Edge)
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

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      return true;
    }

    return false;
  };

  return {
    isInstallable,
    isInstalled,
    isIos,
    isSafari,
    install
  };
}