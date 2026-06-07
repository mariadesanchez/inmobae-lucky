'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  propertyId: string;
  initialIsFavorite?: boolean;
  className?: string;
}

export default function FavoriteButton({ propertyId, initialIsFavorite = false, className = '' }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setShowAuthModal(true);
        return;
      }

      // Optimistic update
      const newStatus = !isFavorite;
      setIsFavorite(newStatus);

      if (newStatus) {
        const { error } = await supabase
          .from('user_favorites')
          .insert({ user_id: user.id, property_id: propertyId });
          
        if (error) {
          // Revert on error
          console.error('Error adding favorite:', error);
          setIsFavorite(!newStatus);
          alert('Hubo un error al agregar a favoritos.');
        }
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .match({ user_id: user.id, property_id: propertyId });
          
        if (error) {
          // Revert on error
          console.error('Error removing favorite:', error);
          setIsFavorite(!newStatus);
          alert('Hubo un error al quitar de favoritos.');
        }
      }
    } catch (error) {
      console.error('Unexpected error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={handleToggle}
        disabled={isLoading}
        className={`absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-argentina-blue hover:text-white transition-colors text-argentina-navy z-10 flex items-center justify-center shadow-sm disabled:opacity-50 ${className}`}
        aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      >
        <span className={`material-icons text-lg ${isFavorite ? 'text-red-500' : 'font-material-icons'}`}>
          {isFavorite ? 'favorite' : 'favorite_border'}
        </span>
      </button>

      {/* Auth Modal */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-argentina-navy/40 backdrop-blur-sm transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setShowAuthModal(false);
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 transform transition-all text-center border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-argentina-blue/10 text-argentina-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-icons text-3xl">lock</span>
            </div>
            <h3 className="text-xl font-bold text-argentina-navy mb-2 font-sf-pro">Iniciar Sesión</h3>
            <p className="text-gray-500 text-sm mb-6 font-sf-pro">
              Debes iniciar sesión en tu cuenta para poder agregar propiedades a tus favoritos.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAuthModal(false);
                }}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-argentina-navy font-medium hover:bg-gray-50 transition-colors flex-1 font-sf-pro text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAuthModal(false);
                  router.push('/login');
                }}
                className="px-5 py-2.5 rounded-lg bg-argentina-blue hover:bg-argentina-blue/90 text-white font-medium shadow-md transition-colors flex-1 flex items-center justify-center gap-2 font-sf-pro text-sm"
              >
                Ir a Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
