'use client';

import { useState, useEffect } from 'react';
import { registerOperation } from '@/app/actions/transactions';
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
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
      await registerOperation({
        property_id: propertyId,
        operation_type: formData.operation_type as 'venta' | 'alquiler',
        price: Number(formData.price),
        operation_date: new Date(formData.operation_date).toISOString(),
        notes: formData.notes
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/properties');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      alert(err.message);
    } finally {
      setLoading(false);
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
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}
            
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
          </div>
        )}
      </div>
    </div>
  );
}
