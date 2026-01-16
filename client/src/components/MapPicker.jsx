import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DEFAULT_CENTER = { lat: 12.84198, lng: 80.15493 }; // VIT Chennai Admin (accurate)

// Component to handle map clicks and drag
const LocationMarker = ({ position, setPosition }) => {
    const markerRef = useRef(null);

    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    setPosition(marker.getLatLng());
                }
            },
        }),
        [setPosition],
    );

    return position === null ? null : (
        <Marker
            position={position}
            draggable={true}
            eventHandlers={eventHandlers}
            ref={markerRef}
        >
            <Popup>You selected this location</Popup>
        </Marker>
    );
};

// Component to center map on coordinates
const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, 18);
        }
    }, [center, map]);
    return null;
};

const MapPicker = ({ onLocationSelect, initialPosition }) => {
    const [position, setPosition] = useState(initialPosition || DEFAULT_CENTER);

    const handlePositionChange = (latlng) => {
        setPosition(latlng);
        onLocationSelect({
            type: 'Point',
            coordinates: [latlng.lat, latlng.lng]
        });
    };

    return (
        <div className="h-96 w-full rounded-xl overflow-hidden shadow-sm border border-gray-200 z-0 relative">
            <MapContainer
                center={DEFAULT_CENTER}
                zoom={16}
                scrollWheelZoom={true}
                dragging={true}
                style={{ height: '100%', width: '100%' }}
                maxBounds={[[6, 68], [36, 98]]} // Approximate India Bounds
                minZoom={4}
                maxZoom={19} // Prevent grey tiles
            >
                {/* Esri World Imagery (Satellite) */}
                <TileLayer
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    maxZoom={19}
                    maxNativeZoom={18}
                />

                {/* Optional: Add labels on top of satellite */}
                <TileLayer
                    url="https://tiles.stadiamaps.com/tiles/stamen_toner_labels/{z}/{x}/{y}{r}.png?api_key=084444b8-fd48-48d9-923f-54ed3b00cf5d"
                    minZoom={0}
                    maxZoom={20}
                />

                <LocationMarker position={position} setPosition={handlePositionChange} />

                <MapUpdater center={position} />
            </MapContainer>

            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg text-sm text-gray-900 shadow-lg z-[1000] border border-gray-200">
                <p className="font-bold flex items-center gap-2">
                    📍 Select Location
                </p>
                <p className="text-gray-600 text-xs mt-1">
                    Click on the map or drag the marker to pinpoint the exact location.
                </p>
            </div>
        </div>
    );
};

export default MapPicker;
