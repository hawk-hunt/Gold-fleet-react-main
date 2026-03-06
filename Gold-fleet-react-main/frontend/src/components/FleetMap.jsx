import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';

// Custom marker icons based on vehicle status
const createMarkerIcon = (status) => {
  const colors = {
    moving: '#22c55e',    // green
    stopped: '#f97316',   // orange
    offline: '#9ca3af'    // gray
  };

  const color = colors[status] || colors.offline;

  return L.divIcon({
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        cursor: pointer;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      </div>
    `,
    className: 'fleet-map-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

// Component to handle auto-fitting bounds
function MapFitBounds({ vehicles }) {
  const map = useMap();

  useEffect(() => {
    if (!vehicles || vehicles.length === 0) return;

    const bounds = vehicles.map(v => [v.latitude, v.longitude]);
    if (bounds.length > 0) {
      try {
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 13,
          animate: true
        });
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    }
  }, [vehicles, map]);

  return null;
}

// Info panel component
function InfoPanel({ vehicles }) {
  const stats = {
    total: vehicles.length,
    moving: vehicles.filter(v => v.status === 'moving').length,
    stopped: vehicles.filter(v => v.status === 'stopped').length,
    offline: vehicles.filter(v => v.status === 'offline').length
  };

  return (
    <div className="absolute top-4 right-4 z-[400] bg-white rounded-lg shadow-lg p-4 w-72 backdrop-blur-sm bg-opacity-95">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Fleet Status</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Total Vehicles</span>
          <span className="text-xl font-bold text-gray-900">{stats.total}</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-gray-700">Moving</span>
          </div>
          <span className="text-lg font-bold text-green-600">{stats.moving}</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm font-medium text-gray-700">Stopped</span>
          </div>
          <span className="text-lg font-bold text-orange-600">{stats.stopped}</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-sm font-medium text-gray-700">Offline</span>
          </div>
          <span className="text-lg font-bold text-gray-500">{stats.offline}</span>
        </div>
      </div>
    </div>
  );
}

// No vehicles message component
function NoVehiclesMessage() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-[300] pointer-events-none">
      <div className="bg-white rounded-lg shadow-xl p-8 text-center backdrop-blur-sm">
        <svg
          className="w-16 h-16 mx-auto text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2m4-4l2 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Vehicles Online</h3>
        <p className="text-gray-500 text-sm">No active vehicles to display on the map</p>
      </div>
    </div>
  );
}

/**
 * FleetMap Component
 * 
 * Interactive fleet tracking map using Leaflet and React-Leaflet
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.vehicles - Array of vehicle objects with structure:
 *   {
 *     id: number,
 *     driver_name: string,
 *     vehicle_name: string,
 *     latitude: number,
 *     longitude: number,
 *     speed: number,
 *     status: "moving" | "stopped" | "offline"
 *   }
 * 
 * @example
 * const vehicles = [
 *   {
 *     id: 1,
 *     driver_name: "John Doe",
 *     vehicle_name: "Vehicle 1",
 *     latitude: 40.7128,
 *     longitude: -74.0060,
 *     speed: 45,
 *     status: "moving"
 *   }
 * ];
 * 
 * return <FleetMap vehicles={vehicles} />
 */
export default function FleetMap({ vehicles = [] }) {
  const [mapKey, setMapKey] = useState(0);

  // Default center (world view)
  const defaultCenter = [20, 0];
  const defaultZoom = 2;

  // Calculate center from vehicles or use default
  const mapCenter = vehicles.length > 0
    ? [
        vehicles.reduce((sum, v) => sum + v.latitude, 0) / vehicles.length,
        vehicles.reduce((sum, v) => sum + v.longitude, 0) / vehicles.length
      ]
    : defaultCenter;

  // Handle container resizing for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setMapKey(prev => prev + 1);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden shadow-md border border-gray-200">
      <MapContainer
        key={mapKey}
        center={mapCenter}
        zoom={defaultZoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
        dragging={true}
        className="leaflet-container"
      >
        {/* OpenStreetMap Tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        {/* Auto-fit bounds to vehicles */}
        <MapFitBounds vehicles={vehicles} />

        {/* Vehicle Markers */}
        {vehicles.map((vehicle) => (
          <Marker
            key={vehicle.id}
            position={[vehicle.latitude, vehicle.longitude]}
            icon={createMarkerIcon(vehicle.status)}
          >
            <Popup
              closeButton={true}
              autoClose={false}
              maxWidth={300}
              className="vehicle-popup"
            >
              <div className="p-2 text-sm">
                <div className="font-semibold text-gray-900 mb-2">{vehicle.vehicle_name}</div>
                <div className="space-y-1 text-gray-700">
                  <div><span className="font-medium">Driver:</span> {vehicle.driver_name}</div>
                  <div><span className="font-medium">Speed:</span> {vehicle.speed} km/h</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        vehicle.status === 'moving'
                          ? 'bg-green-100 text-green-800'
                          : vehicle.status === 'stopped'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Info Panel */}
        {vehicles.length > 0 && <InfoPanel vehicles={vehicles} />}

        {/* No Vehicles Message */}
        {vehicles.length === 0 && <NoVehiclesMessage />}
      </MapContainer>
    </div>
  );
}
