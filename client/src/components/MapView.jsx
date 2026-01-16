import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom marker icon with proper anchor point for centering
const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41], // Center horizontally, anchor at bottom
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    shadowAnchor: [12, 41]
});

// Component to fix map centering
const MapCenterFix = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        // Invalidate size and recenter after a short delay
        const timer = setTimeout(() => {
            map.invalidateSize();
            map.setView(position, map.getZoom());
        }, 100);

        return () => clearTimeout(timer);
    }, [map, position]);

    return null;
};

const MapView = ({
    coordinates,
    title,
    className = "h-64 md:h-96 w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200",
    interactive = false
}) => {
    // Default to VIT Chennai coordinates if no coordinates provided
    const position = coordinates && coordinates.coordinates && Array.isArray(coordinates.coordinates) && coordinates.coordinates.length === 2
        ? [coordinates.coordinates[0], coordinates.coordinates[1]]
        : [12.84198, 80.15493];

    return (
        <div className={`${className} z-0 relative`}>
            <MapContainer
                center={position}
                zoom={17}
                scrollWheelZoom={interactive}
                zoomControl={interactive}
                dragging={interactive}
                maxZoom={19} // Limit max zoom to prevent grey tiles
                minZoom={4}
                style={{ height: '100%', width: '100%' }}
                maxBounds={[[6, 68], [36, 98]]} // India Bounds
                key={`${position[0]}-${position[1]}`}
            >
                {/* Esri World Imagery (Satellite) */}
                <TileLayer
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    maxZoom={19}
                    maxNativeZoom={18}
                />

                {/* Labels */}
                <TileLayer
                    url="https://tiles.stadiamaps.com/tiles/stamen_toner_labels/{z}/{x}/{y}{r}.png?api_key=084444b8-fd48-48d9-923f-54ed3b00cf5d"
                    minZoom={0}
                    maxZoom={20}
                />

                <Marker position={position} icon={customIcon}>
                    <Popup>{title || 'Item Location'}</Popup>
                </Marker>

                <MapCenterFix position={position} />
            </MapContainer>
        </div>
    );
};

export default MapView;
