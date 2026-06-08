'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Lazy load the modal so it's not included in the initial bundle
const ClosedPropertiesModal = dynamic(() => import('./ClosedPropertiesModal'), {
  ssr: false,
});

export default function ClosedPropertiesButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-white dark:bg-[#152e2a] hover:bg-gray-50 dark:hover:bg-white/5 border border-argentina-blue/20 text-argentina-navy dark:text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all flex items-center gap-2"
      >
        <span className="material-icons text-argentina-blue text-base">real_estate_agent</span> Propiedades Cerradas
      </button>

      {isOpen && <ClosedPropertiesModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
