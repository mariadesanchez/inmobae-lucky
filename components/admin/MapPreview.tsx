'use client';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix missing marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper component to update map center dynamically
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapPreview({ lat, lng }: { lat: string | number, lng: string | number }) {
  const parsedLat = parseFloat(lat as string);
  const parsedLng = parseFloat(lng as string);

  const isValid = !isNaN(parsedLat) && !isNaN(parsedLng) && (lat !== '' && lng !== '');
  // Default to a world view if coordinates are invalid
  const center: [number, number] = isValid ? [parsedLat, parsedLng] : [20, 0];
  const zoom = isValid ? 15 : 2;

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      scrollWheelZoom={false} 
      style={{ height: '100%', width: '100%', zIndex: 10 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {isValid && <Marker position={center} />}
      <ChangeView center={center} zoom={zoom} />
    </MapContainer>
  );
}
