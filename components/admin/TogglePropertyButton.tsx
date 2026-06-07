'use client';

import { useState, useTransition } from 'react';
import { togglePropertyStatus } from '@/app/actions/properties';

export default function TogglePropertyButton({ id, isActive }: { id: number; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await togglePropertyStatus(id, !isActive);
      } catch (error: any) {
        console.error('Failed to update status:', error);
        alert('Error al actualizar el estado: ' + error.message);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`p-2 rounded-md transition-colors ${
        isPending
          ? 'text-gray-400 cursor-not-allowed'
          : isActive
          ? 'text-argentina-navy-muted dark:text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
          : 'text-argentina-navy-muted dark:text-gray-400 hover:text-argentina-blue hover:bg-argentina-blue/5 dark:hover:bg-argentina-blue/20'
      }`}
      title={isActive ? 'Desactivar Propiedad' : 'Activar Propiedad'}
    >
      <span className="material-icons text-[18px]">
        {isPending ? 'hourglass_empty' : isActive ? 'visibility_off' : 'visibility'}
      </span>
    </button>
  );
}
