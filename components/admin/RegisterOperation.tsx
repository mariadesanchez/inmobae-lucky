'use client';

import { useState, useEffect } from 'react';
import { registerOperation, undoOperation } from '@/app/actions/transactions';
import { useRouter } from 'next/navigation';

interface RegisterOperationProps {
  propertyId: string;
  status?: string;
  currentPrice?: string | number;
  isActive?: boolean;
}

export default function RegisterOperation({ propertyId, status, currentPrice, isActive }: RegisterOperationProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [undoLoading, setUndoLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorModal, setErrorModal] = useState<{isOpen: boolean, message: string} | null>(null);
  
  const [formData, setFormData] = useState({
    operation_type: status === 'alquilar' ? 'alquiler' : 'venta',
    price: currentPrice ? String(currentPrice) : '',
    operation_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Update operation_type if status changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      operation_type: status === 'alquilar' ? 'alquiler' : 'venta'
    }));
  }, [status]);

  // Sync price if currentPrice changes
  useEffect(() => {
    if (currentPrice !== undefined) {
      setFormData(prev => ({
        ...prev,
        price: String(currentPrice)
      }));
    }
  }, [currentPrice]);

  const handleSubmit = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await registerOperation({
        property_id: propertyId,
        operation_type: formData.operation_type as 'venta' | 'alquiler',
        price: Number(formData.price),
        operation_date: new Date(formData.operation_date).toISOString(),
        notes: formData.notes
      });
      
      if (result && !result.success) {
        setErrorModal({ isOpen: true, message: result.error || 'Error desconocido' });
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/properties');
      }, 2000);
    } catch (err: any) {
      setErrorModal({ isOpen: true, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    setUndoLoading(true);
    setError('');
    
    try {
      const result = await undoOperation(propertyId);
      
      if (result && !result.success) {
        setErrorModal({ isOpen: true, message: result.error || 'Error desconocido' });
        setUndoLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/properties');
      }, 2000);
    } catch (err: any) {
      setErrorModal({ isOpen: true, message: err.message });
    } finally {
      setUndoLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24 mt-8">
      <div className="px-6 py-4 border-b border-argentina-blue/20 flex items-center gap-3 bg-gradient-to-r from-argentina-blue/10 to-transparent">
        <div className="w-8 h-8 rounded-full bg-argentina-blue flex items-center justify-center text-white">
          <span className="material-icons text-lg">gavel</span>
        </div>
        <h2 className="text-lg font-bold text-argentina-navy">Registrar Cierre de Operación</h2>
      </div>
      
      <div className="p-6">
        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center gap-3">
            <span className="material-icons">check_circle</span>
            <p className="font-medium text-sm">Operación registrada exitosamente. Redirigiendo...</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-argentina-navy mb-1.5 font-sf-pro">Tipo de Operación</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-gray-50 text-argentina-navy focus:ring-1 focus:ring-argentina-blue outline-none text-sm font-sf-pro"
                  value={formData.operation_type}
                  disabled
                >
                  <option value="venta">Venta</option>
                  <option value="alquiler">Alquiler</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-argentina-navy mb-1.5 font-sf-pro">Precio Final ($)</label>
                <input 
                  type="number" 
                  required
                  readOnly
                  className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-gray-50 text-argentina-navy-muted focus:ring-0 outline-none text-sm font-sf-pro cursor-not-allowed"
                  value={formData.price}
                  placeholder="Se actualiza desde Información Básica"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-argentina-navy mb-1.5 font-sf-pro">Fecha de Cierre</label>
              <input 
                type="date" 
                required
                className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-argentina-navy focus:ring-1 focus:ring-argentina-blue outline-none text-sm font-sf-pro"
                value={formData.operation_date}
                onChange={(e) => setFormData({...formData, operation_date: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-argentina-navy mb-1.5 font-sf-pro">Notas (Opcional)</label>
              <textarea 
                rows={2}
                className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-argentina-navy focus:ring-1 focus:ring-argentina-blue outline-none text-sm font-sf-pro"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Detalles sobre el comprador, comisiones, etc."
              />
            </div>

            <p className="text-xs text-gray-500 font-sf-pro bg-gray-50 p-3 rounded border border-gray-100">
              <span className="font-semibold text-argentina-navy">Atención:</span> Al registrar la operación, esta propiedad cambiará su estado a "Inactiva" para que deje de mostrarse en el listado público.
            </p>

            <button 
              type="button"
              onClick={handleSubmit}
              disabled={loading || isActive === false}
              className="w-full bg-argentina-navy hover:bg-argentina-navy/90 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Procesando...
                </>
              ) : isActive === false ? (
                <>
                  <span className="material-icons text-[18px]">lock</span>
                  Operación ya registrada (Inactiva)
                </>
              ) : (
                <>
                  <span className="material-icons text-[18px]">done_all</span>
                  Marcar como {formData.operation_type === 'venta' ? 'Vendida' : 'Alquilada'}
                </>
              )}
            </button>

            {isActive === false && (
              <button 
                type="button"
                onClick={handleUndo}
                disabled={undoLoading}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm mt-3"
              >
                {undoLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <span className="material-icons text-[18px]">undo</span>
                    Deshacer {formData.operation_type === 'venta' ? 'Venta' : 'Alquiler'}
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

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
    </div>
  );
}
