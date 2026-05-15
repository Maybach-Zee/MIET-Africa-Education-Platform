import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Inner component for placing marker on click
const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position ? <Marker position={position} /> : null;
};

// Search control (free text search)
const SearchControl = () => {
  const map = useMap();
  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const control = new GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: true,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
    });
    map.addControl(control);
    return () => map.removeControl(control);
  }, [map]);
  return null;
};

// Component to sync map center when external position changes
const MapUpdater = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 15, { animate: true });
    }
  }, [position?.lat, position?.lng, map]);
  return null;
};

const MapPicker = ({ lat, lng, onChange }) => {
  const [position, setPosition] = useState(
    lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null
  );

  // When external lat/lng props change (from city dropdown), update internal position
  useEffect(() => {
    if (lat && lng) {
      const newPos = { lat: parseFloat(lat), lng: parseFloat(lng) };
      setPosition(newPos);
    }
  }, [lat, lng]);

  const handlePositionChange = (latlng) => {
    setPosition(latlng);
    if (onChange) {
      onChange({
        lat: latlng.lat.toFixed(6),
        lng: latlng.lng.toFixed(6),
      });
    }
  };

  const defaultCenter = { lat: -28.5, lng: 24.5 };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <MapContainer
        center={position || defaultCenter}
        zoom={position ? 15 : 6}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SearchControl />
        <LocationMarker position={position} setPosition={handlePositionChange} />
        <MapUpdater position={position} />
      </MapContainer>
    </div>
  );
};

export default MapPicker;