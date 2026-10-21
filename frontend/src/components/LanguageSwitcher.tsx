import React, { useState, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, availableLanguages, languageMeta } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const container = event.target as Node;
      if (!document.body.contains(container)) return;
      // Check if click was outside the component
      if (event.target instanceof Element && !event.target.closest('[data-lang-switcher]')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div data-lang-switcher className="relative inline-block">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors shadow-sm"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{languageMeta.flag} {languageMeta.nativeName}</span>
        <span className="sm:hidden">{languageMeta.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-48 sm:w-56 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={(e) => {
                e.stopPropagation();
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                language === lang.code
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="font-medium">{lang.nativeName}</span>
              <span className="text-[10px] opacity-50 uppercase">{lang.code}</span>
              {language === lang.code && (
                <Check className="ml-auto w-4 h-4 text-emerald-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;

