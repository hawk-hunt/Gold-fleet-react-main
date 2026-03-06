import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FaPlay, FaStop, FaMapMarkerAlt, FaRoute, FaClock, FaCar } from 'react-icons/fa';

// Utility function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Utility function to format duration
const formatDuration = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const diffMs = end - start;
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins}m`;
};

// Fix for marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom vehicle marker icon
const vehicleIcon = L.divIcon({
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
  className: 'vehicle-marker',
  html: `
    <div style="
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #CFAF4B;
      border: 3px solid white;
      box-shadow: 0 0 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: white;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 16 16">
        <path d="M8 1a1 1 0 0 1 1 1v4h4a1 1 0 0 1 .82 1.573l-4 6A1 1 0 0 1 8 14a1 1 0 0 1-.82-.427l-4-6A1 1 0 0 1 3 6h4V2a1 1 0 0 1 1-1z"/>
      </svg>
    </div>
  `
});

export default function DriverDashboard() {
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [routeWaypoints, setRouteWaypoints] = useState([]);
  const [currentLocation, setCurrentLocation] = useState([40.7128, -74.0060]); // Default to NYC
  const [tripDistance, setTripDistance] = useState(0);
  const [tripDuration, setTripDuration] = useState('0h 0m');
  const mapRef = useRef(null);

  // Update trip duration every minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentTrip) {
        const duration = formatDuration(currentTrip.created_at, currentTrip.updated_at);
        setTripDuration(duration);
      }
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [currentTrip]);

  // Calculate initial trip duration
  useEffect(() => {
    if (currentTrip) {
      const duration = formatDuration(currentTrip.created_at, currentTrip.updated_at);
      setTripDuration(duration);
    }
  }, [currentTrip]);

  // Fetch driver's vehicle and current trip
  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        setLoading(true);
        
        // Get all drivers and find the one for this user
        const driversResponse = await api.getDrivers();
        const drivers = driversResponse.data || driversResponse;
        const userDriver = Array.isArray(drivers) ? drivers[0] : null;
        
        if (userDriver && userDriver.vehicle_id) {
          // Get the vehicle
          const vehicleResponse = await api.getVehicle(userDriver.vehicle_id);
          const vehicleData = vehicleResponse.data || vehicleResponse;
          setVehicle(vehicleData);
        }

        // Get all trips and find active ones for this driver
        const tripsResponse = await api.getTrips();
        const trips = tripsResponse.data || tripsResponse;
        const activeTrip = Array.isArray(trips) ? trips.find(trip => trip.status === 'active') : null;
        setCurrentTrip(activeTrip);

      } catch (err) {
        console.error('Error fetching driver data:', err);
        setError('Failed to load driver data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDriverData();
    }
  }, [user]);

  // Start GPS tracking
  const startGPSTracking = () => {
    if (!vehicle) return;

    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = [latitude, longitude];
          
          setCurrentLocation(newLocation);
          
          // Add waypoint to route
          setRouteWaypoints(prev => {
            const updated = [...prev, newLocation];
            return updated;
          });

          // Calculate distance if we have multiple waypoints
          if (routeWaypoints.length > 0) {
            const lastPoint = routeWaypoints[routeWaypoints.length - 1];
            const segmentDistance = calculateDistance(lastPoint[0], lastPoint[1], latitude, longitude);
            setTripDistance(prev => prev + segmentDistance);
          }
          
          try {
            await api.sendVehicleLocation({
              vehicle_id: vehicle.id,
              latitude,
              longitude,
              timestamp: new Date().toISOString(),
            });
          } catch (err) {
            console.error('Error sending location:', err);
          }
        },
        (error) => {
          console.error('GPS error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
      setWatchId(id);
      setRouteWaypoints([currentLocation]); // Initialize route with current position
    }
  };

  // Stop GPS tracking
  const stopGPSTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setRouteWaypoints([]);
      setTripDistance(0);
    }
  };

  // Start trip
  const startTrip = async () => {
    if (!vehicle || !user) return;
    
    try {
      await api.createTrip({
        vehicle_id: vehicle.id,
        driver_id: user.id,
        start_location: 'Current Location',
        end_location: 'TBD',
        start_time: new Date().toISOString().slice(0, 16),
        status: 'active',
        trip_date: new Date().toISOString().split('T')[0],
        start_mileage: 0,
      });
      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error('Error starting trip:', err);
      setError('Failed to start trip');
    }
  };

  // End trip
  const endTrip = async () => {
    if (!currentTrip) return;
    
    try {
      await api.updateTrip(currentTrip.id, {
        ...currentTrip,
        status: 'completed',
        end_location: 'Current Location',
        end_time: new Date().toISOString().slice(0, 16),
      });
      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error('Error ending trip:', err);
      setError('Failed to end trip');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-yellow-600" />
                Vehicle Location
              </h2>
              <div className="h-96 rounded-lg overflow-hidden">
                <MapContainer
                  center={currentLocation}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  ref={mapRef}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {/* Route Line */}
                  {routeWaypoints.length > 1 && (
                    <Polyline 
                      positions={routeWaypoints} 
                      color="blue" 
                      weight={3}
                      opacity={0.7}
                    />
                  )}
                  
                  {/* Vehicle Marker */}
                  {vehicle && (
                    <Marker position={currentLocation} icon={vehicleIcon}>
                      <Popup>
                        <div className="text-sm">
                          <h3 className="font-semibold">{vehicle.make} {vehicle.model}</h3>
                          <p className="text-xs">License: {vehicle.license_plate}</p>
                          <p className="text-xs">Status: {vehicle.status}</p>
                          {currentTrip && (
                            <>
                              <p className="text-xs mt-2 font-semibold">Trip Stats:</p>
                              <p className="text-xs">Distance: {tripDistance.toFixed(2)} km</p>
                              <p className="text-xs">Duration: {tripDuration}</p>
                            </>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Trip Information & Controls */}
          <div className="space-y-6">
            {/* Trip Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaRoute className="mr-2 text-yellow-600" />
                Current Trip
              </h2>
              {currentTrip ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium capitalize">{currentTrip.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Start Location</p>
                    <p className="font-medium">{currentTrip.start_location}</p>
                  </div>
                  {currentTrip.end_location && (
                    <div>
                      <p className="text-sm text-gray-600">End Location</p>
                      <p className="font-medium">{currentTrip.end_location}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Started</p>
                    <p className="font-medium">{new Date(currentTrip.created_at).toLocaleString()}</p>
                  </div>
                  
                  {/* Trip Calculations */}
                  <div className="border-t pt-3 space-y-3">
                    <div className="flex justify-between items-center bg-blue-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Distance Traveled</p>
                      <p className="font-bold text-blue-600">{tripDistance.toFixed(2)} km</p>
                    </div>
                    <div className="flex justify-between items-center bg-green-50 p-3 rounded">
                      <p className="text-sm text-gray-600">Trip Duration</p>
                      <p className="font-bold text-green-600">{tripDuration}</p>
                    </div>
                    {tripDistance > 0 && (
                      <div className="flex justify-between items-center bg-orange-50 p-3 rounded">
                        <p className="text-sm text-gray-600">Avg Speed</p>
                        <p className="font-bold text-orange-600">
                          {tripDuration && currentTrip ? 
                            (tripDistance / ((new Date() - new Date(currentTrip.created_at)) / 3600000)).toFixed(2) 
                            : '0.00'
                          } km/h
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No active trip</p>
              )}
            </div>

            {/* Vehicle Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaCar className="mr-2 text-yellow-600" />
                Assigned Vehicle
              </h2>
              {vehicle ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Vehicle</p>
                    <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">License Plate</p>
                    <p className="font-medium">{vehicle.license_plate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium capitalize">{vehicle.status}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No vehicle assigned</p>
              )}
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaClock className="mr-2 text-yellow-600" />
                Trip Controls
              </h2>
              <div className="space-y-3">
                {!currentTrip ? (
                  <button
                    onClick={startTrip}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center"
                  >
                    <FaPlay className="mr-2" />
                    Start Trip
                  </button>
                ) : (
                  <button
                    onClick={endTrip}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center"
                  >
                    <FaStop className="mr-2" />
                    End Trip
                  </button>
                )}
                
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-600 mb-2">GPS Tracking</p>
                  {!watchId ? (
                    <button
                      onClick={startGPSTracking}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                    >
                      Start GPS Tracking
                    </button>
                  ) : (
                    <button
                      onClick={stopGPSTracking}
                      className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                    >
                      Stop GPS Tracking
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}