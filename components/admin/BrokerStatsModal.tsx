'use client';

import { useState, useEffect } from 'react';
import { getBrokerStats } from '@/app/actions/transactions';
import { BrokerStats } from '@/types/transaction';
import dynamic from 'next/dynamic';

const BrokerStatsMap = dynamic(() => import('./BrokerStatsMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[300px] bg-gray-100 dark:bg-white/5 animate-pulse rounded-xl flex items-center justify-center text-sm font-medium text-gray-400">Cargando mapa...</div>
});

export default function BrokerStatsModal({ onClose }: { onClose: () => void }) {
  const [stats, setStats] = useState<BrokerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getBrokerStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch broker stats", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-argentina-navy/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#152e2a] w-full max-w-6xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10">
        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex-shrink-0 flex items-center justify-between bg-gray-50/50 dark:bg-black/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-argentina-sun/20 flex items-center justify-center text-argentina-navy dark:text-argentina-sun">
              <span className="material-icons text-xl">insights</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-argentina-navy dark:text-white">Resumen de Operaciones</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Métricas y rendimiento de la cartera inmobiliaria</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center text-gray-500 transition-colors"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-argentina-blue/20 border-t-argentina-blue rounded-full animate-spin"></div>
              <p className="text-gray-500 dark:text-gray-400 animate-pulse">Calculando estadísticas...</p>
            </div>
          ) : stats ? (
            <div className="space-y-8">
              {/* KPIs Principales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#1f3e3a] p-5 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Volumen Ventas</p>
                  <p className="text-3xl font-bold text-argentina-navy dark:text-white">{formatCurrency(stats.revenueSales)}</p>
                  <p className="text-xs text-green-600 mt-2 font-medium flex items-center gap-1">
                    <span className="material-icons text-[14px]">trending_up</span> {stats.totalSales} operaciones
                  </p>
                </div>
                <div className="bg-white dark:bg-[#1f3e3a] p-5 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Volumen Alquileres</p>
                  <p className="text-3xl font-bold text-argentina-navy dark:text-white">{formatCurrency(stats.revenueRents)}</p>
                  <p className="text-xs text-green-600 mt-2 font-medium flex items-center gap-1">
                    <span className="material-icons text-[14px]">trending_up</span> {stats.totalRents} operaciones
                  </p>
                </div>
                <div className="bg-argentina-blue p-5 rounded-xl shadow-sm text-white">
                  <p className="text-sm font-medium text-white/80 mb-1">Total Propiedades</p>
                  <p className="text-3xl font-bold">{stats.totalProperties}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs font-medium text-white/90">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400"></div> {stats.activeProperties} Activas</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400"></div> {stats.inactiveProperties} Inactivas</span>
                  </div>
                </div>
              </div>

              {/* Tiempos Promedio */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Eficiencia (Días en el Mercado)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                    <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1f3e3a] flex items-center justify-center text-argentina-navy dark:text-white shadow-sm">
                      <span className="material-icons">sell</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Tiempo Promedio Ventas</p>
                      <p className="text-xl font-bold text-argentina-navy dark:text-white">{stats.avgDaysOnMarketSales} días</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                    <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1f3e3a] flex items-center justify-center text-argentina-navy dark:text-white shadow-sm">
                      <span className="material-icons">key</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Tiempo Promedio Alquileres</p>
                      <p className="text-xl font-bold text-argentina-navy dark:text-white">{stats.avgDaysOnMarketRents} días</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mapas Georeferenciados */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 mt-8">Ubicaciones Geográficas</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
                  <BrokerStatsMap 
                    title="Propiedades en Venta" 
                    properties={stats.mapData.filter(p => p.type === 'venta')} 
                  />
                  <BrokerStatsMap 
                    title="Propiedades en Alquiler" 
                    properties={stats.mapData.filter(p => p.type === 'alquiler')} 
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500">No se pudieron cargar las estadísticas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
