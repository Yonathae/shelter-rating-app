import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Shelter } from '../types';

// Fix default marker icons broken by webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type Props = {
  shelters: Shelter[];
  onShelterPress: (shelter: Shelter) => void;
};

export default function ShelterMap({ shelters, onShelterPress }: Props) {
  // Inject Leaflet CSS
  useEffect(() => {
    const id = 'leaflet-css';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }, []);

  return (
    <MapContainer
      center={[32.0853, 34.7818]}
      zoom={14}
      style={{ flex: 1, height: '100%', width: '100%', minHeight: 400 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {shelters.map((shelter) => (
        <Marker key={shelter.id} position={[shelter.lat, shelter.lng]}>
          <Popup>
            <div style={{ minWidth: 160 }}>
              <strong style={{ fontSize: 14 }}>{shelter.name}</strong>
              <div style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>{shelter.address}</div>
              {shelter.overall_score ? (
                <div style={{ fontSize: 13, color: '#4f6ef7', fontWeight: 600 }}>
                  ⭐ {Number(shelter.overall_score).toFixed(1)} / 5
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#aaa' }}>No ratings yet</div>
              )}
              <button
                onClick={() => onShelterPress(shelter)}
                style={{
                  marginTop: 8,
                  padding: '6px 12px',
                  backgroundColor: '#4f6ef7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                  width: '100%',
                }}
              >
                View details →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
