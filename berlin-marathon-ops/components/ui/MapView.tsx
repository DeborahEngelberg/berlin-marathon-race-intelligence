'use client';

import { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface Marker {
  lat: number;
  lng: number;
  label: string;
  popup?: string;
  color?: string;
}

interface Props {
  markers: Marker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  connectMarkers?: boolean;
}

export default function MapView({ markers, center, zoom = 12, height = '300px', connectMarkers = false }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    // Dynamic import for Leaflet (SSR-safe)
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;

      // Load CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const L = (await import('leaflet')).default;

      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapRef.current || mapInstanceRef.current) return;

      const validMarkers = markers.filter(m => m.lat && m.lng);
      const mapCenter = center || (validMarkers.length > 0
        ? [validMarkers[0].lat, validMarkers[0].lng] as [number, number]
        : [52.5200, 13.4050] as [number, number]);

      const map = L.map(mapRef.current).setView(mapCenter, zoom);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      const colorMap: Record<string, string> = {
        red: '#DC2F02',
        blue: '#3B82F6',
        green: '#10B981',
        orange: '#E85D04',
        purple: '#8B5CF6',
        yellow: '#F59E0B',
      };

      const latLngs: L.LatLng[] = [];

      validMarkers.forEach((m, i) => {
        const color = colorMap[m.color || 'orange'] || colorMap.orange;
        const markerIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);">${i + 1}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([m.lat, m.lng], { icon: markerIcon }).addTo(map);
        if (m.popup || m.label) {
          marker.bindPopup(`<b>${m.label}</b>${m.popup ? '<br/>' + m.popup : ''}`);
        }
        latLngs.push(L.latLng(m.lat, m.lng));
      });

      if (connectMarkers && latLngs.length > 1) {
        L.polyline(latLngs, { color: '#E85D04', weight: 3, dashArray: '8, 8', opacity: 0.7 }).addTo(map);
      }

      if (latLngs.length > 1) {
        map.fitBounds(L.latLngBounds(latLngs).pad(0.2));
      }

      setLeafletLoaded(true);
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const validMarkers = markers.filter(m => m.lat && m.lng);

  if (validMarkers.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-[var(--bg-elevated)] text-center text-sm text-[var(--text-muted)]">
        <p>Map coordinates not available. Use Google Maps links below:</p>
        <div className="mt-2 space-y-1">
          {markers.map((m, i) => (
            <a
              key={i}
              href={`https://www.google.com/maps/search/${encodeURIComponent(m.label + ' Berlin')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 text-[var(--accent)] hover:underline"
            >
              <ExternalLink size={12} /> {m.label}
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border border-[var(--border)]">
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
