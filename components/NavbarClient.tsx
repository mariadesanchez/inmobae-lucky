'use client';

import Link from 'next/link';
import UserMenu from './UserMenu';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface NavbarClientProps {
  dict?: any;
  
  user: any;
  isAdmin: boolean;
}

export default function NavbarClient({ dict, user, isAdmin }: NavbarClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isBuscarActive = pathname === '/buscar';
  const isFavoritosActive = pathname === '/favoritos';

  return (
    <nav className="sticky top-0 z-50 bg-argentina-light/60 backdrop-blur-lg border-b border-argentina-navy/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-2 cursor-pointer">
            <span className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-argentina-navy to-argentina-blue">Inmobae-Lucky</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/buscar" 
              className={`font-medium text-sm px-1 py-1 transition-all ${
                isBuscarActive 
                  ? 'text-argentina-blue border-b-2 border-argentina-blue font-semibold' 
                  : 'text-argentina-navy/70 hover:text-argentina-navy hover:border-b-2 hover:border-argentina-navy/20'
              }`}
            >
              {dict?.properties || 'Todas las Propiedades'}
            </Link>
            <Link 
              href="/favoritos" 
              className={`font-medium text-sm px-1 py-1 transition-all ${
                isFavoritosActive 
                  ? 'text-argentina-blue border-b-2 border-argentina-blue font-semibold' 
                  : 'text-argentina-navy/70 hover:text-argentina-navy hover:border-b-2 hover:border-argentina-navy/20'
              }`}
            >
              {dict?.saved || 'Favoritos'}
            </Link>

            {isAdmin && (
              <div className="flex items-center space-x-4 border-l border-argentina-navy/20 pl-6 ml-2">
                <Link href={`/admin/properties`} className="flex items-center gap-1.5 text-argentina-blue font-semibold text-sm hover:text-argentina-blue/80 transition-colors bg-argentina-sun/30 px-3 py-1.5 rounded-md">
                  <span className="material-icons text-[16px]">holiday_village</span>
                  Propiedades
                </Link>
                <Link href={`/admin/users`} className="flex items-center gap-1.5 text-argentina-blue font-semibold text-sm hover:text-argentina-blue/80 transition-colors bg-argentina-sun/30 px-3 py-1.5 rounded-md">
                  <span className="material-icons text-[16px]">people</span>
                  Usuarios
                </Link>
              </div>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center gap-3 sm:gap-4">

            {user ? (
              <div className="pl-2 border-l border-argentina-navy/10">
                <UserMenu user={user} />
              </div>
            ) : (
              <Link
                href={`/login`}
                className="text-argentina-navy font-semibold hover:text-argentina-blue transition-colors px-3 py-2 flex items-center gap-1.5"
              >
                <span className="material-icons text-[18px]">login</span>
                Ingresar
              </Link>
            )}

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-argentina-navy hover:bg-argentina-navy/5 transition-colors"
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
        <div className="md:hidden border-t border-argentina-navy/10 bg-argentina-light shadow-lg">
          <div className="px-4 py-3 space-y-1">
            <Link 
              href="/buscar" 
              onClick={() => setIsMenuOpen(false)} 
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                isBuscarActive 
                  ? 'text-argentina-blue bg-argentina-blue/10 font-semibold' 
                  : 'text-argentina-navy hover:bg-argentina-navy/5'
              }`}
            >
              {dict?.properties || 'Todas las Propiedades'}
            </Link>
            <Link 
              href="/favoritos" 
              onClick={() => setIsMenuOpen(false)} 
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                isFavoritosActive 
                  ? 'text-argentina-blue bg-argentina-blue/10 font-semibold' 
                  : 'text-argentina-navy hover:bg-argentina-navy/5'
              }`}
            >
              {dict?.saved || 'Favoritos'}
            </Link>

            {isAdmin && (
              <>
                <div className="my-2 border-t border-argentina-navy/10" />
                <Link href={`/admin/properties`} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-argentina-blue bg-argentina-sun/30">
                  <span className="material-icons text-base">holiday_village</span>
                  Admin – Properties
                </Link>
                <Link href={`/admin/users`} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-argentina-blue bg-argentina-sun/30">
                  <span className="material-icons text-base">people</span>
                  Admin – Users
                </Link>
              </>
            )}

          </div>
        </div>
      )}
    </nav>
  );
}
