import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Marigold marker SVG (for restaurants)
const marigoldMarkerSVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
  <ellipse cx="16" cy="39" rx="7" ry="3" fill="rgba(0,0,0,0.18)"/>
  <path d="M16 2C9.37 2 4 7.37 4 14c0 9.5 12 26 12 26S28 23.5 28 14C28 7.37 22.63 2 16 2z"
        fill="#F5B92C" stroke="#2B1710" stroke-width="1.5"/>
  <circle cx="16" cy="14" r="5" fill="#2B1710"/>
  <circle cx="16" cy="14" r="2.5" fill="#F5B92C"/>
</svg>`);

// Kebab-brown marker (campus)
const campusMarkerSVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
  <ellipse cx="16" cy="39" rx="7" ry="3" fill="rgba(0,0,0,0.18)"/>
  <path d="M16 2C9.37 2 4 7.37 4 14c0 9.5 12 26 12 26S28 23.5 28 14C28 7.37 22.63 2 16 2z"
        fill="#2B1710" stroke="#F5B92C" stroke-width="1.5"/>
  <text x="16" y="19" text-anchor="middle" font-size="10" fill="white">🏫</text>
</svg>`);

const restaurantIcon = new L.Icon({
    iconUrl:    `data:image/svg+xml,${marigoldMarkerSVG}`,
    iconSize:   [28, 38],
    iconAnchor: [14, 38],
    popupAnchor:[0, -34],
});

const campusIcon = new L.Icon({
    iconUrl:    `data:image/svg+xml,${campusMarkerSVG}`,
    iconSize:   [32, 42],
    iconAnchor: [16, 42],
    popupAnchor:[0, -38],
});

const MapController = ({ focusLocation }) => {
    const map = useMap();
    useEffect(() => {
        if (focusLocation) {
            map.flyTo([focusLocation.latitude, focusLocation.longitude], 16, { animate: true, duration: 1.2 });
        }
    }, [focusLocation, map]);
    return null;
};

export const MapView = ({ restaurants, focusRestaurant, onMapClose }) => {
    const IIIT = [26.8636, 81.0008];

    return (
        <div
            className="relative w-full rounded-2xl overflow-hidden border"
            style={{ height: '360px', borderColor: 'var(--color-card-border)', boxShadow: '0 4px 20px rgba(43,23,16,0.10)' }}
            id="map-view"
        >
            {/* Close button */}
            <button
                onClick={onMapClose}
                className="absolute top-3 right-3 z-[400] flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-md transition-all hover:opacity-90"
                style={{ background: 'var(--color-kebab-brown)', color: 'white', fontFamily: 'var(--font-body)' }}
            >
                ✕ Close Map
            </button>

            {/* Result count badge */}
            <div
                className="absolute top-3 left-3 z-[400] rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{ background: 'var(--color-marigold)', color: 'var(--color-kebab-brown)', fontFamily: 'var(--font-mono)' }}
            >
                {restaurants.length} places
            </div>

            <MapContainer center={IIIT} zoom={12} scrollWheelZoom={false} style={{ width: '100%', height: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                />

                {/* IIIT Lucknow campus marker */}
                <Marker position={IIIT} icon={campusIcon}>
                    <Popup>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-kebab-brown)', fontSize: '0.9rem' }}>
                            🏫 IIIT Lucknow
                        </div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#8b6e5a', marginTop: '2px' }}>
                            Ahmamau, Lucknow
                        </div>
                    </Popup>
                </Marker>

                {/* Restaurant markers */}
                {restaurants.map((r) => (
                    <Marker key={r.id} position={[r.latitude, r.longitude]} icon={restaurantIcon}>
                        <Popup>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-kebab-brown)', marginBottom: '4px' }}>
                                {r.name}
                            </div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: '#8b6e5a', marginBottom: '4px' }}>
                                {r.area}
                            </div>
                            <div className="flex items-center gap-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                                <span style={{ color: 'var(--color-chili-red)', fontWeight: 600 }}>⭐ {r.rating}</span>
                                <span style={{ color: '#8b6e5a' }}>|</span>
                                <span style={{ color: 'var(--color-kebab-brown)' }}>₹{r.budget_per_person_inr}</span>
                                <span style={{ color: '#8b6e5a' }}>|</span>
                                <span style={{ color: 'var(--color-pudina-green)' }}>{r.distance_from_campus_km} km</span>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {focusRestaurant && <MapController focusLocation={focusRestaurant} />}
            </MapContainer>
        </div>
    );
};
