'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Locale } from '@/i18n-config';

const languages: { code: Locale; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

export default function LanguageSelector({ currentLocale }: { currentLocale: Locale }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  const activeLang = languages.find((l) => l.code === currentLocale) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (locale: Locale) => {
    // Save to cookie (this is also handled by middleware but good to do immediately)
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    
    // Replace current locale segment in URL
    const segments = pathname.split('/');
    segments[1] = locale; // since pathname starts with '/', index 1 is the locale
    const newPath = segments.join('/');
    
    setIsOpen(false);
    
    // Force hard navigation to apply server translations correctly
    window.location.href = newPath;
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-nordic-muted hover:text-mosque font-medium transition-colors p-2 rounded-md hover:bg-nordic/5 text-sm"
      >
        <span className="material-icons font-material-icons text-[18px]">language</span>
        <span className="hidden sm:inline">{activeLang.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-nordic/5 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-mosque/5 transition-colors ${
                currentLocale === lang.code ? 'text-mosque font-medium bg-mosque/5' : 'text-nordic'
              }`}
            >
              <span className="text-base leading-none">{lang.flag}</span>
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
