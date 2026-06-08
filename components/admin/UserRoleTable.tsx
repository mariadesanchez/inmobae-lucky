'use client';

import { useState, useTransition } from 'react';
import { updateUserRole } from '@/app/actions/roles';
import { deleteUserAction } from '@/app/actions/users';

type UserWithRole = {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: 'admin' | 'user';
  created_at: string;
};

interface UserRoleTableProps {
  users: UserWithRole[];
  currentUserId: string;
}

export default function UserRoleTable({ users, currentUserId }: UserRoleTableProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticUsers, setOptimisticUsers] = useState(users);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    userId: string;
    newRole: 'admin' | 'user';
    userName: string;
  } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  } | null>(null);

  const handleDropdownChange = (user: UserWithRole, newRole: 'admin' | 'user') => {
    if (user.role === newRole) return;
    setConfirmModal({
      isOpen: true,
      userId: user.id,
      newRole,
      userName: user.name,
    });
  };

  const handleConfirmRoleChange = () => {
    if (!confirmModal) return;
    const { userId, newRole } = confirmModal;
    setConfirmModal(null);
    
    // Optimistic update
    setOptimisticUsers(current => 
      current.map(u => u.id === userId ? { ...u, role: newRole } : u)
    );

    startTransition(async () => {
      try {
        const result = await updateUserRole(userId, newRole);
        if (result && result.error) {
          setErrorModal({ isOpen: true, message: result.error });
          setOptimisticUsers(users); // Revert on error
        }
      } catch (e: any) {
        console.error(e);
        setErrorModal({ isOpen: true, message: e.message || 'An unexpected error occurred' });
        // Revert on error
        setOptimisticUsers(users);
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteModal) return;
    const { userId } = deleteModal;
    setDeleteModal(null);
    
    // Optimistic update
    setOptimisticUsers(current => current.filter(u => u.id !== userId));

    startTransition(async () => {
      try {
        const result = await deleteUserAction(userId);
        if (result && result.error) {
          setErrorModal({ isOpen: true, message: result.error });
          setOptimisticUsers(users); // Revert on error
        }
      } catch (e: any) {
        console.error(e);
        setErrorModal({ isOpen: true, message: e.message || 'Error inesperado al eliminar' });
        // Revert on error
        setOptimisticUsers(users);
      }
    });
  };

  return (
    <div className="space-y-4">
      {optimisticUsers.map((user) => (
        <div key={user.id} className={`user-card group relative rounded-xl p-5 shadow-sm border flex flex-col md:grid md:grid-cols-12 gap-4 items-center transition-all ${user.role === 'admin' ? 'bg-argentina-sun dark:bg-argentina-blue/20 border-transparent hover:shadow-soft' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-argentina-sun/50 dark:hover:bg-argentina-blue/10'}`}>
          
          {/* User Details */}
          <div className="col-span-12 md:col-span-4 flex items-center w-full">
            <div className="relative flex-shrink-0">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className={`h-12 w-12 rounded-full object-cover border-2 ${user.role === 'admin' ? 'border-white dark:border-argentina-blue' : 'border-transparent'}`}
              />
              <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${user.role === 'admin' ? 'bg-green-400' : 'bg-gray-400'}`}></span>
            </div>
            <div className="ml-4 overflow-hidden">
              <div className="text-sm font-bold text-argentina-navy dark:text-white truncate flex items-center gap-2">
                {user.name}
                {user.id === currentUserId && <span className="text-[10px] px-1.5 py-0.5 rounded bg-argentina-blue text-white">You</span>}
              </div>
              <div className="text-xs text-argentina-navy/70 dark:text-gray-300 truncate">{user.email}</div>
              <div className={`mt-1 text-[10px] px-2 py-0.5 inline-block rounded transition-colors ${user.role === 'admin' ? 'bg-white/50 text-argentina-navy/60' : 'bg-gray-50 dark:bg-white/10 text-argentina-navy/50 dark:text-gray-400 group-hover:bg-white/50'}`}>
                ID: #{user.id.substring(0, 8).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Role & Status */}
          <div className="col-span-12 md:col-span-3 w-full flex items-center justify-between md:justify-start gap-4">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${user.role === 'admin' ? 'bg-argentina-blue/10 text-argentina-blue dark:bg-argentina-blue dark:text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
              {user.role === 'admin' ? 'Administrator' : 'User'}
            </span>
            <div className="flex items-center text-xs text-argentina-navy/60 dark:text-gray-400">
              <span className={`material-icons text-[14px] mr-1 ${user.role === 'admin' ? 'text-argentina-blue' : 'text-gray-400'}`}>
                {user.role === 'admin' ? 'check_circle' : 'schedule'}
              </span>
              Active
            </div>
          </div>

          {/* Performance / Stats */}
          <div className="col-span-12 md:col-span-3 w-full block">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-argentina-navy/50">Joined</div>
              <div className="text-sm font-semibold text-argentina-navy dark:text-white">
                {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="col-span-12 md:col-span-2 w-full flex justify-end relative items-center gap-2">
            <select
              value={user.role}
              onChange={(e) => handleDropdownChange(user, e.target.value as 'admin' | 'user')}
              disabled={isPending}
              className={`inline-flex items-center px-4 py-2 text-xs font-medium rounded-lg focus:outline-none transition-colors w-full md:w-auto justify-center cursor-pointer appearance-none ${
                user.role === 'admin' 
                  ? 'border border-argentina-navy/10 bg-white dark:bg-gray-800 shadow-sm text-argentina-navy hover:bg-argentina-navy hover:text-white' 
                  : 'border border-gray-200 dark:border-gray-600 bg-transparent text-argentina-navy/70 dark:text-gray-300 hover:border-argentina-navy hover:text-argentina-navy dark:hover:text-white group-hover:bg-white group-hover:shadow-sm'
              }`}
            >
              <option value="user">User Role</option>
              <option value="admin">Admin Role</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-10 flex items-center pr-2">
              <span className="material-icons text-[16px] text-current">expand_more</span>
            </div>
            
            <button
              onClick={() => setDeleteModal({ isOpen: true, userId: user.id, userName: user.name })}
              className="ml-2 p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center"
              title="Eliminar usuario"
            >
              <span className="material-icons text-[18px]">delete</span>
            </button>
          </div>

        </div>
      ))}

      {optimisticUsers.length === 0 && (
        <div className="p-12 text-center text-argentina-navy-muted bg-white dark:bg-[#152e2a] rounded-xl border border-argentina-navy/5">
          No users found.
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-argentina-navy/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 transform transition-all text-center border border-gray-100">
            <div className="w-16 h-16 bg-argentina-blue/10 text-argentina-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-icons text-3xl">manage_accounts</span>
            </div>
            <h3 className="text-xl font-bold text-argentina-navy mb-2 font-sf-pro">Cambiar Rol de Usuario</h3>
            <p className="text-gray-500 text-sm mb-6 font-sf-pro">
              ¿Estás seguro de que deseas cambiar el rol de <strong>{confirmModal.userName}</strong> a <strong>{confirmModal.newRole === 'admin' ? 'Administrador' : 'Usuario'}</strong>?
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setConfirmModal(null)}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-argentina-navy font-medium hover:bg-gray-50 transition-colors flex-1 font-sf-pro text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmRoleChange}
                className="px-5 py-2.5 rounded-lg bg-argentina-blue hover:bg-argentina-blue/90 text-white font-medium shadow-md transition-colors flex-1 flex items-center justify-center gap-2 font-sf-pro text-sm"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-argentina-navy/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 transform transition-all text-center border border-gray-100">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-icons text-3xl">error_outline</span>
            </div>
            <h3 className="text-xl font-bold text-argentina-navy mb-2 font-sf-pro">Acción Denegada</h3>
            <p className="text-gray-500 text-sm mb-6 font-sf-pro">
              {errorModal.message}
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => setErrorModal(null)}
                className="px-5 py-2.5 rounded-lg bg-argentina-blue hover:bg-argentina-blue/90 text-white font-medium shadow-md transition-colors w-full font-sf-pro text-sm"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-argentina-navy/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 transform transition-all text-center border border-gray-100">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-icons text-3xl">delete_outline</span>
            </div>
            <h3 className="text-xl font-bold text-argentina-navy mb-2 font-sf-pro">Eliminar Usuario</h3>
            <p className="text-gray-500 text-sm mb-6 font-sf-pro">
              ¿Estás seguro de que deseas eliminar a <strong>{deleteModal.userName}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setDeleteModal(null)}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-argentina-navy font-medium hover:bg-gray-50 transition-colors flex-1 font-sf-pro text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium shadow-md transition-colors flex-1 flex items-center justify-center gap-2 font-sf-pro text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
