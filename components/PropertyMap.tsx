'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface PropertyMapProps {
  location: string;
  title: string;
}

const PropertyMap = ({ location, title }: PropertyMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let coords: [number, number] = [37.4419, -122.1430]; // Default: Palo Alto, CA
    const locLower = location.toLowerCase();

    if (locLower.includes('beverly hills') || locLower.includes('los angeles') || locLower.includes('malibu') || locLower.includes('california') || locLower.includes('ca')) {
      coords = [34.0736, -118.4004];
    } else if (locLower.includes('vancouver')) {
      coords = [49.2827, -123.1207];
    } else if (locLower.includes('seattle')) {
      coords = [47.6062, -122.3321];
    } else if (locLower.includes('portland')) {
      coords = [45.5152, -122.6784];
    } else if (locLower.includes('miami')) {
      coords = [25.7617, -80.1918];
    } else if (locLower.includes('chicago')) {
      coords = [41.8781, -87.6298];
    } else if (locLower.includes('austin') || locLower.includes('tx')) {
      coords = [30.2672, -97.7431];
    } else if (locLower.includes('tahoe')) {
      coords = [39.0968, -120.0324];
    } else if (locLower.includes('denver')) {
      coords = [39.7392, -104.9903];
    } else if (locLower.includes('cape cod')) {
      coords = [41.7145, -70.2520];
    } else if (locLower.includes('london')) {
      coords = [51.5074, -0.1278];
    } else if (locLower.includes('edinburgh')) {
      coords = [55.9533, -3.1883];
    } else if (locLower.includes('geneva')) {
      coords = [46.2044, 6.1432];
    } else if (locLower.includes('cotswolds')) {
      coords = [51.8330, -1.8433];
    }

    const map = L.map(mapContainerRef.current, {
      center: coords,
      zoom: 13,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Setup marker custom icons to avoid Next.js module loading issues
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    L.Marker.prototype.options.icon = DefaultIcon;

    const marker = L.marker(coords).addTo(map);
    marker.bindPopup(`<b>${title}</b><br/>${location}`).openPopup();

    return () => {
      map.remove();
    };
  }, [location, title]);

  return <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '300px' }} />;
};

export default PropertyMap;
