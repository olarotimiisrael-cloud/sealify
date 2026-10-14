import React from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, availableLanguages, languageMeta } = useLanguage();

  return (
    <div className="relative inline-block">
      <button
        onClick={() => {}}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-100 text-sm font-medium transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{languageMeta.flag} {languageMeta.nativeName}</span>
        <span className="sm:hidden">{languageMeta.flag}</span>
      </button>

      <div className="absolute right-0 top-full mt-2 z-50 w-48 sm:w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
        {availableLanguages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
              language === lang.code
                ? 'bg-emerald-500/10 text-white'
                : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <span className="text-base">{lang.flag}</span>
            <span className="font-medium">{lang.nativeName}</span>
            <span className="text-[10px] opacity-60 uppercase">{lang.code}</span>
            {language === lang.code && (
              <Check className="ml-auto w-4 h-4 text-emerald-400" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;