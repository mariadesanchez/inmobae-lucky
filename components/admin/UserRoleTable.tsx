'use client';

import { useState, useTransition } from 'react';
import { updateUserRole } from '@/app/actions/roles';

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
  const [errorId, setErrorId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    userId: string;
    newRole: 'admin' | 'user';
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
    setErrorId(null);

    startTransition(async () => {
      try {
        const result = await updateUserRole(userId, newRole);
        if (result && result.error) {
          alert(result.error);
          setErrorId(userId);
          setOptimisticUsers(users); // Revert on error
        }
      } catch (e: any) {
        console.error(e);
        alert(e.message || 'An unexpected error occurred');
        setErrorId(userId);
        // Revert on error
        setOptimisticUsers(users);
      }
    });
  };

  return (
    <div className="space-y-4">
      {optimisticUsers.map((user) => (
        <div key={user.id} className={`user-card group relative rounded-xl p-5 shadow-sm border flex flex-col md:grid md:grid-cols-12 gap-4 items-center transition-all ${user.role === 'admin' ? 'bg-hint-of-green dark:bg-mosque/20 border-transparent hover:shadow-soft' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-hint-of-green/50 dark:hover:bg-mosque/10'}`}>
          
          {/* User Details */}
          <div className="col-span-12 md:col-span-4 flex items-center w-full">
            <div className="relative flex-shrink-0">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className={`h-12 w-12 rounded-full object-cover border-2 ${user.role === 'admin' ? 'border-white dark:border-mosque' : 'border-transparent'}`}
              />
              <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${user.role === 'admin' ? 'bg-green-400' : 'bg-gray-400'}`}></span>
            </div>
            <div className="ml-4 overflow-hidden">
              <div className="text-sm font-bold text-nordic dark:text-white truncate flex items-center gap-2">
                {user.name}
                {user.id === currentUserId && <span className="text-[10px] px-1.5 py-0.5 rounded bg-mosque text-white">You</span>}
              </div>
              <div className="text-xs text-nordic/70 dark:text-gray-300 truncate">{user.email}</div>
              <div className={`mt-1 text-[10px] px-2 py-0.5 inline-block rounded transition-colors ${user.role === 'admin' ? 'bg-white/50 text-nordic/60' : 'bg-gray-50 dark:bg-white/10 text-nordic/50 dark:text-gray-400 group-hover:bg-white/50'}`}>
                ID: #{user.id.substring(0, 8).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Role & Status */}
          <div className="col-span-12 md:col-span-3 w-full flex items-center justify-between md:justify-start gap-4">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${user.role === 'admin' ? 'bg-mosque/10 text-mosque dark:bg-mosque dark:text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
              {user.role === 'admin' ? 'Administrator' : 'User'}
            </span>
            <div className="flex items-center text-xs text-nordic/60 dark:text-gray-400">
              <span className={`material-icons text-[14px] mr-1 ${user.role === 'admin' ? 'text-mosque' : 'text-gray-400'}`}>
                {user.role === 'admin' ? 'check_circle' : 'schedule'}
              </span>
              Active
            </div>
          </div>

          {/* Performance / Stats */}
          <div className="col-span-12 md:col-span-3 w-full grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-nordic/50">Joined</div>
              <div className="text-sm font-semibold text-nordic dark:text-white">
                {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-nordic/50">Access Level</div>
              <div className="text-sm font-semibold text-nordic dark:text-white">
                {user.role === 'admin' ? 'Level 5' : 'Level 1'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="col-span-12 md:col-span-2 w-full flex justify-end relative items-center gap-2">
            {errorId === user.id && (
              <span className="text-red-500 text-xs material-icons" title="Update failed">error</span>
            )}
            <select
              value={user.role}
              onChange={(e) => handleDropdownChange(user, e.target.value as 'admin' | 'user')}
              disabled={isPending}
              className={`inline-flex items-center px-4 py-2 text-xs font-medium rounded-lg focus:outline-none transition-colors w-full md:w-auto justify-center cursor-pointer appearance-none ${
                user.role === 'admin' 
                  ? 'border border-nordic/10 bg-white dark:bg-gray-800 shadow-sm text-nordic hover:bg-nordic hover:text-white' 
                  : 'border border-gray-200 dark:border-gray-600 bg-transparent text-nordic/70 dark:text-gray-300 hover:border-nordic hover:text-nordic dark:hover:text-white group-hover:bg-white group-hover:shadow-sm'
              }`}
            >
              <option value="user">User Role</option>
              <option value="admin">Admin Role</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <span className="material-icons text-[16px] text-current">expand_more</span>
            </div>
          </div>

        </div>
      ))}

      {optimisticUsers.length === 0 && (
        <div className="p-12 text-center text-nordic-muted bg-white dark:bg-[#152e2a] rounded-xl border border-nordic/5">
          No users found.
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nordic/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 transform transition-all text-center border border-gray-100">
            <div className="w-16 h-16 bg-mosque/10 text-mosque rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-icons text-3xl">manage_accounts</span>
            </div>
            <h3 className="text-xl font-bold text-nordic mb-2 font-sf-pro">Cambiar Rol de Usuario</h3>
            <p className="text-gray-500 text-sm mb-6 font-sf-pro">
              ¿Estás seguro de que deseas cambiar el rol de <strong>{confirmModal.userName}</strong> a <strong>{confirmModal.newRole === 'admin' ? 'Administrador' : 'Usuario'}</strong>?
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setConfirmModal(null)}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-nordic font-medium hover:bg-gray-50 transition-colors flex-1 font-sf-pro text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmRoleChange}
                className="px-5 py-2.5 rounded-lg bg-mosque hover:bg-mosque/90 text-white font-medium shadow-md transition-colors flex-1 flex items-center justify-center gap-2 font-sf-pro text-sm"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
