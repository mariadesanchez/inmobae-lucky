'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapProperty } from '@/types/transaction';

interface BrokerStatsMapProps {
  properties: MapProperty[];
  title: string;
}

const BrokerStatsMap = ({ properties, title }: BrokerStatsMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center map on Argentina (default) or the first property
    const defaultCenter: [number, number] = properties.length > 0 
      ? [properties[0].lat, properties[0].lng] 
      : [-34.6037, -58.3816];

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: properties.length > 0 ? 11 : 5,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Create a custom green icon for closed properties
    const greenIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Create a default blue icon for active properties
    const blueIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const bounds = L.latLngBounds([]);

    properties.forEach(prop => {
      if (prop.lat && prop.lng) {
        const marker = L.marker([prop.lat, prop.lng], {
          icon: prop.isClosed ? greenIcon : blueIcon
        }).addTo(map);

        bounds.extend([prop.lat, prop.lng]);

        const statusBadge = prop.isClosed 
          ? `<span style="background:#dcfce7;color:#166534;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;">${prop.type === 'venta' ? 'Vendida' : 'Alquilada'}</span>`
          : `<span style="background:#e0e7ff;color:#3730a3;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;">Activa</span>`;

        marker.bindPopup(`
          <div style="font-family:sans-serif;">
            <b style="font-size:13px;display:block;margin-bottom:4px;">${prop.title}</b>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              ${statusBadge}
              <span style="font-weight:bold;color:#1f2937;">${formatCurrency(prop.price)}</span>
            </div>
          </div>
        `);
      }
    });

    if (properties.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }

    return () => {
      map.remove();
    };
  }, [properties]);

  return (
    <div className="flex flex-col bg-white dark:bg-[#1f3e3a] rounded-xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden h-full">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/10">
        <h3 className="text-sm font-bold text-argentina-navy dark:text-white flex items-center gap-2">
          <span className="material-icons text-argentina-blue text-lg">map</span>
          {title}
        </h3>
        <div className="flex gap-4 mt-2 text-[10px] uppercase font-bold text-gray-500">
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Activas</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Cerradas</span>
        </div>
      </div>
      <div ref={mapContainerRef} className="w-full flex-grow min-h-[300px] z-0 relative" />
    </div>
  );
};

export default BrokerStatsMap;
