import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { SupportedLanguage, LANGUAGES, TRANSLATIONS, LanguageMeta } from '@/translations/languages';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatNumber: (num: number) => string;
  languageMeta: LanguageMeta;
  availableLanguages: LanguageMeta[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'sealify_language';

function detectBrowserLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language.toLowerCase();
  
  if (browserLang.startsWith('yo')) return 'yo';
  if (browserLang.startsWith('ha')) return 'ha';
  if (browserLang.startsWith('ig')) return 'ig';
  if (browserLang.startsWith('zh') || browserLang.startsWith('cmn')) return 'zh';
  
  return 'en';
}

function getInitialLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en';
  
  const stored = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
  if (stored && stored in LANGUAGES) return stored;
  
  return detectBrowserLanguage();
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => getInitialLanguage());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language, isReady]);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    let translation = dict[key] || TRANSLATIONS.en[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        translation = translation.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    
    return translation;
  }, [language]);

  const formatCurrency = useCallback((amount: number, currency: string = 'NGN'): string => {
    try {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency,
        minimumFractionDigits: currency === 'NGN' ? 0 : 2,
        maximumFractionDigits: currency === 'NGN' ? 0 : 2,
      }).format(amount);
    } catch {
      const symbol = currency === 'NGN' ? '₦' : currency === 'USDT' ? '$' : currency;
      return `${symbol}${amount.toLocaleString()}`;
    }
  }, []);

  const formatNumber = useCallback((num: number): string => {
    try {
      return new Intl.NumberFormat('en-NG').format(num);
    } catch {
      return num.toLocaleString();
    }
  }, []);

  const languageMeta = LANGUAGES[language];
  const availableLanguages = Object.values(LANGUAGES);

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      formatCurrency,
      formatNumber,
      languageMeta,
      availableLanguages,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;