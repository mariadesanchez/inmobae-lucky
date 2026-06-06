'use client';

import Link from 'next/link';
import { Locale } from '@/i18n-config';
import UserMenu from './UserMenu';
import LanguageSelector from './LanguageSelector';
import { useState } from 'react';

interface NavbarClientProps {
  dict?: any;
  locale: Locale;
  user: any;
  isAdmin: boolean;
}

export default function NavbarClient({ dict, locale, user, isAdmin }: NavbarClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-clear-day/95 backdrop-blur-md border-b border-nordic/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-nordic flex items-center justify-center">
              <span className="material-icons text-white text-lg font-material-icons">apartment</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-nordic">LuxeEstate</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#" className="text-mosque font-medium text-sm border-b-2 border-mosque px-1 py-1">
              {dict?.buy || 'Buy'}
            </Link>
            <Link href="#" className="text-nordic/70 hover:text-nordic font-medium text-sm hover:border-b-2 hover:border-nordic/20 px-1 py-1 transition-all">
              {dict?.rent || 'Rent'}
            </Link>
            <Link href="#" className="text-nordic/70 hover:text-nordic font-medium text-sm hover:border-b-2 hover:border-nordic/20 px-1 py-1 transition-all">
              {dict?.commercial || 'Commercial'}
            </Link>
            <Link href="#" className="text-nordic/70 hover:text-nordic font-medium text-sm hover:border-b-2 hover:border-nordic/20 px-1 py-1 transition-all">
              {dict?.saved || 'Saved Homes'}
            </Link>

            {isAdmin && (
              <div className="flex items-center space-x-4 border-l border-nordic/20 pl-6 ml-2">
                <Link href={`/${locale}/admin/properties`} className="flex items-center gap-1.5 text-mosque font-semibold text-sm hover:text-mosque/80 transition-colors bg-hint-of-green/30 px-3 py-1.5 rounded-md">
                  <span className="material-icons text-[16px]">holiday_village</span>
                  Properties
                </Link>
                <Link href={`/${locale}/admin/users`} className="flex items-center gap-1.5 text-mosque font-semibold text-sm hover:text-mosque/80 transition-colors bg-hint-of-green/30 px-3 py-1.5 rounded-md">
                  <span className="material-icons text-[16px]">people</span>
                  Users
                </Link>
              </div>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:block">
              <LanguageSelector currentLocale={locale} />
            </div>

            {user ? (
              <div className="pl-2 border-l border-nordic/10">
                <UserMenu user={user} />
              </div>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-mosque hover:bg-mosque/90 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                {dict?.login || 'Login'}
              </Link>
            )}

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-nordic hover:bg-nordic/5 transition-colors"
              aria-label="Toggle menu"
            >
              <span className="material-icons text-xl">
                {isMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-nordic/10 bg-clear-day shadow-lg">
          <div className="px-4 py-3 space-y-1">
            <Link href="#" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-mosque bg-mosque/10">
              {dict?.buy || 'Buy'}
            </Link>
            <Link href="#" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-nordic hover:bg-nordic/5">
              {dict?.rent || 'Rent'}
            </Link>
            <Link href="#" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-nordic hover:bg-nordic/5">
              {dict?.commercial || 'Commercial'}
            </Link>
            <Link href="#" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-nordic hover:bg-nordic/5">
              {dict?.saved || 'Saved Homes'}
            </Link>

            {isAdmin && (
              <>
                <div className="my-2 border-t border-nordic/10" />
                <Link href={`/${locale}/admin/properties`} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-mosque bg-hint-of-green/30">
                  <span className="material-icons text-base">holiday_village</span>
                  Admin – Properties
                </Link>
                <Link href={`/${locale}/admin/users`} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-mosque bg-hint-of-green/30">
                  <span className="material-icons text-base">people</span>
                  Admin – Users
                </Link>
              </>
            )}

            <div className="pt-2 border-t border-nordic/10">
              <LanguageSelector currentLocale={locale} />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
