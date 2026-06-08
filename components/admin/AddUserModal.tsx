'use client';

import { useState, useTransition } from 'react';
import { createUserAction } from '@/app/actions/users';

export default function AddUserModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const result = await createUserAction(formData);
        if (result && result.error) {
          setErrorMsg(result.error);
        } else {
          setIsOpen(false);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Error desconocido');
      }
    });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-argentina-blue hover:bg-argentina-blue/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md shadow-argentina-blue/20 transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2 whitespace-nowrap"
      >
        <span className="material-icons text-base">add</span> Agregar Usuario
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-argentina-navy/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all border border-gray-100 relative">
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="material-icons">close</span>
            </button>

            <h3 className="text-xl font-bold text-argentina-navy mb-1 font-sf-pro">Agregar Nuevo Usuario</h3>
            <p className="text-sm text-gray-500 mb-6">Completa los datos para crear un nuevo usuario. La confirmación de correo se omitirá automáticamente.</p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-start gap-2">
                <span className="material-icons text-[18px]">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-argentina-navy mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-argentina-blue/50 text-sm"
                  placeholder="ejemplo@correo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-argentina-navy mb-1">Contraseña</label>
                <input 
                  type="password" 
                  name="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-argentina-blue/50 text-sm"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-argentina-navy mb-1">Rol</label>
                <select 
                  name="role"
                  required
                  defaultValue="user"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-argentina-blue/50 text-sm appearance-none bg-white"
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4 mt-6 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 text-argentina-navy font-medium hover:bg-gray-50 transition-colors font-sf-pro text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-lg bg-argentina-blue hover:bg-argentina-blue/90 text-white font-medium shadow-md transition-colors flex items-center justify-center gap-2 font-sf-pro text-sm disabled:opacity-70"
                >
                  {isPending ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
