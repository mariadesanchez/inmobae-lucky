'use client';

import { useState } from 'react';
import BrokerStatsModal from './BrokerStatsModal';

export default function BrokerStatsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-white hover:bg-gray-50 text-argentina-navy border border-gray-200 px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all inline-flex items-center gap-2 dark:bg-[#152e2a] dark:text-white dark:border-white/10 dark:hover:bg-white/5"
      >
        <span className="material-icons text-base text-argentina-blue">insights</span> 
        Ver Estadísticas
      </button>

      {isOpen && <BrokerStatsModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
