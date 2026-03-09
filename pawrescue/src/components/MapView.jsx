import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Component to handle map controls (Locate me & Fit bounds)
function MapControls({ rescues }) {
    const map = useMap();

    useMapEvents({
        locationfound(e) {
            map.flyTo(e.latlng, map.getZoom(), { animate: true, duration: 1.5 });
        },
    });

    const handleLocateMe = (e) => {
        e.preventDefault();
        e.stopPropagation();
        map.locate({ enableHighAccuracy: true });
    };

    const handleFitAll = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const validRescues = rescues.filter(r => r.location?.lat && r.location?.lng);
        if (validRescues.length === 0) return;

        // Extract all lat/lng into bounds
        const bounds = validRescues.map(r => [r.location.lat, r.location.lng]);
        
        // Also include base station
        bounds.push([23.0225, 72.5714]);

        map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.5 });
    };

    // Auto-fit smoothly when rescues load
    useEffect(() => {
        const validRescues = rescues.filter(r => r.location?.lat && r.location?.lng);
        if (validRescues.length > 0) {
            const bounds = validRescues.map(r => [r.location.lat, r.location.lng]);
            bounds.push([23.0225, 72.5714]);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true, duration: 1.5 });
        }
    }, [rescues, map]);

    return (
        <div style={{ position: 'absolute', bottom: '80px', right: '10px', zIndex: 1000, pointerEvents: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                    onClick={handleLocateMe}
                    title="Show my location"
                    style={{
                        backgroundColor: '#fff', color: '#333', border: 'none', width: '40px', height: '40px',
                        borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)', fontSize: '1.2rem'
                    }}
                >
                    📍
                </button>
                <button 
                    onClick={handleFitAll}
                    title="Fit all rescues into view"
                    style={{
                        backgroundColor: '#fff', color: '#333', border: 'none', width: '40px', height: '40px',
                        borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)', fontSize: '1.2rem'
                    }}
                >
                    🗺️
                </button>
            </div>
        </div>
    );
}

function MapView({ rescues = [] }) {
    const position = [23.0225, 72.5714]; // Ahmedabad base station

    return (
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            <MapContainer
                center={position}
                zoom={13}
                zoomControl={false} /* Disable default top-left zoom controls */
                style={{ height: "100%", minHeight: "600px", width: "100%", borderRadius: "12px", zIndex: 0 }}
            >
                {/* Google Maps style bottom-right zoom controls */}
                <ZoomControl position="bottomright" />

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={position}>
                    <Popup>
                        Base Station <br /> Ahmedabad
                    </Popup>
                </Marker>

                {/* Dynamic Rescue Markers */}
                {rescues.map((rescue) => {
                    const lat = rescue.location?.lat;
                    const lng = rescue.location?.lng;
                    if (!lat || !lng) return null;

                    // Handle both Firestore timestamps and MongoDB date strings
                    const dateDisplay = rescue.createdAt?.toDate 
                        ? rescue.createdAt.toDate().toLocaleString() 
                        : new Date(rescue.createdAt).toLocaleString();

                    return (
                        <Marker 
                            key={rescue._id || rescue.id} 
                            position={[lat, lng]}
                        >
                            <Popup>
                                <strong>{rescue.animalType || "Unknown"}</strong> - {rescue.urgency || "Stable"}<br />
                                {rescue.address && <><small>📍 {rescue.address}</small><br /></>}
                                {rescue.description}<br />
                                <small>{dateDisplay}</small>
                            </Popup>
                        </Marker>
                    );
                })}

                <MapControls rescues={rescues} />

            </MapContainer>
        </div>
    );
}

export default MapView;