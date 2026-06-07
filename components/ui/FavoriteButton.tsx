'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface FavoriteButtonProps {
  propertyId: string;
  initialIsFavorite?: boolean;
  className?: string;
}

export default function FavoriteButton({ propertyId, initialIsFavorite = false, className = '' }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Debes iniciar sesión para agregar propiedades a tus favoritos.');
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
  );
}
