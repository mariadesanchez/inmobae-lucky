'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function EditPropertyButton({ id, isActive, locale }: { id: number; isActive: boolean; locale: string }) {
  const [showModal, setShowModal] = useState(false);

  if (isActive) {
    return (
      <Link
        href={`/${locale}/admin/properties/${id}/edit`}
        className="p-2 text-nordic-muted dark:text-gray-400 hover:text-mosque hover:bg-mosque/5 dark:hover:bg-mosque/20 rounded-md transition-colors"
        title="Editar Propiedad"
      >
        <span className="material-icons text-[18px]">edit</span>
      </Link>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-2 text-gray-300 dark:text-gray-600 cursor-not-allowed rounded-md"
        title="Propiedad inactiva"
      >
        <span className="material-icons text-[18px]">edit_off</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nordic/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center border border-gray-100">
            <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-icons text-3xl">lock</span>
            </div>
            <h3 className="text-xl font-bold text-nordic mb-2">Propiedad Inactiva</h3>
            <p className="text-gray-500 text-sm mb-6">
              Para poder editar esta propiedad primero debes <strong>activarla</strong> usando el botón del ojo.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full px-5 py-2.5 rounded-lg bg-mosque hover:bg-mosque/90 text-white font-medium shadow-md transition-colors text-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
