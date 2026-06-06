'use client';

import { useState } from 'react';
import { deleteProperty } from '@/app/actions/properties';

export default function DeletePropertyButton({ id }: { id: number }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProperty(id);
      setShowModal(false);
    } catch (error: any) {
      console.error('Failed to delete:', error);
      alert('Failed to delete property: ' + error.message);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        disabled={isDeleting}
        className={`p-2 rounded-md transition-colors ${
          isDeleting 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-nordic-muted dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
        }`}
        title="Delete Property"
      >
        <span className="material-icons text-[18px]">
          {isDeleting ? 'hourglass_empty' : 'delete'}
        </span>
      </button>

      {/* Tailwind Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nordic/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 transform transition-all text-center border border-gray-100">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-icons text-3xl">warning</span>
            </div>
            <h3 className="text-xl font-bold text-nordic mb-2 font-sf-pro">Eliminar Propiedad</h3>
            <p className="text-gray-500 text-sm mb-6 font-sf-pro">
              ¿Deseas eliminar esta propiedad? Esta acción no se puede deshacer y borrará los datos permanentemente.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setShowModal(false)}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-nordic font-medium hover:bg-gray-50 transition-colors flex-1 font-sf-pro text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium shadow-md transition-colors flex-1 flex items-center justify-center gap-2 font-sf-pro text-sm disabled:opacity-70"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
