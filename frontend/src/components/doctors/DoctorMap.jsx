import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const createIcon = (isSelected) =>
  L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${isSelected ? '#2563eb' : '#ef4444'};
      width: 28px;
      height: 28px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });

const MapUpdater = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
};

const DoctorMap = ({ doctors = [], patientLocation, selectedDoctor, onDoctorSelect, height = '400px' }) => {
  const defaultCenter = patientLocation || [19.076, 72.8777];
  const center = patientLocation || defaultCenter;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700" style={{ height }}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} zoom={13} />

        {patientLocation && (
          <Marker
            position={patientLocation}
            icon={L.divIcon({
              className: 'patient-marker',
              html: `<div style="
                background: #22c55e;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 0 0 4px rgba(34,197,94,0.3);
              "></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          >
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {doctors.map((doctor) => (
          <Marker
            key={doctor._id}
            position={[doctor.latitude, doctor.longitude]}
            icon={createIcon(selectedDoctor?._id === doctor._id)}
            eventHandlers={{
              click: () => onDoctorSelect?.(doctor),
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{doctor.name}</p>
                <p>{doctor.specialization}</p>
                <p>{doctor.hospital}</p>
                <p>{doctor.distance} km away</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DoctorMap;
