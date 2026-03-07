import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FaPlay, FaStop, FaMapMarkerAlt, FaRoute, FaClock, FaCar, FaClipboardList, FaExclamationTriangle, FaBell, FaEnvelope, FaCheckCircle, FaChevronRight } from 'react-icons/fa';
import VehicleInspectionChecklist from '../components/VehicleInspectionChecklist';
import ManualIssueReport from '../components/ManualIssueReport';

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
  const [showInspection, setShowInspection] = useState(false);
  const [showIssueReport, setShowIssueReport] = useState(false);
  const [driverId, setDriverId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showMessages, setShowMessages] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, trip, maintenance
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mapRef = useRef(null);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on larger screens
  useEffect(() => {
    if (windowSize.width >= 1024) {
      setSidebarOpen(false);
    }
  }, [windowSize.width]);

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
        
        if (userDriver) {
          setDriverId(userDriver.id);
          if (userDriver.vehicle_id) {
            // Get the vehicle
            const vehicleResponse = await api.getVehicle(userDriver.vehicle_id);
            const vehicleData = vehicleResponse.data || vehicleResponse;
            setVehicle(vehicleData);
          }
        }

        // Get all trips and find active ones for this driver
        const tripsResponse = await api.getTrips();
        const trips = tripsResponse.data || tripsResponse;
        const activeTrip = Array.isArray(trips) ? trips.find(trip => trip.status === 'active') : null;
        setCurrentTrip(activeTrip);

        // Fetch messages (notifications)
        fetchMessages();

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

  // Fetch messages/notifications
  const fetchMessages = async () => {
    try {
      // Simulated messages - in a real app, these would come from the API
      // For now, we'll create mock messages for demo purposes
      const mockMessages = [
        {
          id: 1,
          type: 'info',
          title: 'Maintenance Reminder',
          message: 'Your vehicle is due for oil change in 500 km',
          timestamp: new Date(Date.now() - 3600000),
          read: false
        },
        {
          id: 2,
          type: 'warning',
          title: 'Vehicle Alert',
          message: 'Please check tire pressure before next trip',
          timestamp: new Date(Date.now() - 7200000),
          read: false
        },
        {
          id: 3,
          type: 'success',
          title: 'Trip Completed',
          message: 'Your last trip was completed successfully',
          timestamp: new Date(Date.now() - 86400000),
          read: true
        }
      ];
      setMessages(mockMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Mark message as read
  const markMessageAsRead = (messageId) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    ));
  };

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

  // Handle Inspection Submission
  const handleInspectionSubmit = async (inspectionData) => {
    try {
      setLoading(true);
      await api.createInspection(inspectionData);
      setShowInspection(false);
      setError(null);
      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error('Error submitting inspection:', err);
      setError('Failed to submit inspection');
      setLoading(false);
    }
  };

  // Handle Issue Report Submission
  const handleIssueSubmit = async (issueData) => {
    try {
      setLoading(true);
      await api.createIssue(issueData);
      setShowIssueReport(false);
      setError(null);
      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error('Error submitting issue:', err);
      setError('Failed to submit issue report');
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg">
        <div className="w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold truncate">{getGreeting()}, {user?.name?.split(' ')[0]}</h1>
              <p className="text-yellow-100 mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base">
                Welcome • {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
            {/* Messages Bell Icon - Mobile Optimized */}
            <button
              onClick={() => setShowMessages(!showMessages)}
              className="relative p-2 sm:p-3 hover:bg-yellow-500 rounded-full transition-colors flex-shrink-0"
              aria-label="Messages"
            >
              <FaBell className="text-lg sm:text-xl" />
              {messages.some(m => !m.read) && (
                <span className="absolute top-0 right-0 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Quick Stats Row - Responsive Grid */}
        {currentTrip && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 line-clamp-1">
                <FaRoute className="text-blue-600 flex-shrink-0" />
                <span className="hidden sm:inline">Distance</span>
                <span className="sm:hidden">Dist</span>
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{tripDistance.toFixed(1)} km</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 line-clamp-1">
                <FaClock className="text-green-600 flex-shrink-0" />
                <span className="hidden sm:inline">Duration</span>
                <span className="sm:hidden">Time</span>
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{tripDuration}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 line-clamp-1">
                <FaCar className="text-yellow-600 flex-shrink-0" />
                <span className="hidden sm:inline">Vehicle</span>
                <span className="sm:hidden">Car</span>
              </p>
              <p className="text-sm sm:text-lg font-bold text-gray-900 mt-1 line-clamp-1">{vehicle?.make}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 line-clamp-1">
                <FaCheckCircle className="text-orange-600 flex-shrink-0" />
                <span className="hidden sm:inline">Status</span>
                <span className="sm:hidden">Info</span>
              </p>
              <p className="text-sm sm:text-lg font-bold text-green-600 capitalize mt-1">{currentTrip?.status}</p>
            </div>
          </div>
        )}

        {/* Messages Panel - Responsive */}
        {showMessages && (
          <div className="mb-4 sm:mb-8 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden max-h-96 sm:max-h-full">
            <div className="sticky top-0 bg-gradient-to-r from-yellow-50 to-gray-50 border-b border-gray-200 p-3 sm:p-4 z-10">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaEnvelope className="text-yellow-600 flex-shrink-0" />
                <span>Messages</span>
                <span className="text-sm text-gray-500">({messages.filter(m => !m.read).length})</span>
              </h3>
            </div>
            <div className="overflow-y-auto max-h-80">
              {messages.length === 0 ? (
                <div className="p-4 sm:p-6 text-center text-gray-500">
                  <FaCheckCircle className="mx-auto text-2xl sm:text-3xl mb-2 text-green-400" />
                  <p className="text-sm sm:text-base">No messages</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => markMessageAsRead(msg.id)}
                      className={`p-3 sm:p-4 cursor-pointer transition-colors hover:bg-gray-50 ${!msg.read ? 'bg-yellow-50 border-l-4 border-yellow-600' : ''}`}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className={`mt-1 p-1.5 sm:p-2 rounded flex-shrink-0 ${
                          msg.type === 'success' ? 'bg-green-100' :
                          msg.type === 'warning' ? 'bg-orange-100' :
                          'bg-blue-100'
                        }`}>
                          {msg.type === 'success' ? <FaCheckCircle className="text-green-600 text-sm sm:text-base" /> :
                           msg.type === 'warning' ? <FaExclamationTriangle className="text-orange-600 text-sm sm:text-base" /> :
                           <FaBell className="text-blue-600 text-sm sm:text-base" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{msg.title}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{msg.message}</p>
                          <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                            {msg.timestamp.toLocaleString()}
                          </p>
                        </div>
                        {!msg.read && <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Navigation - Responsive and Scrollable */}
        <div className="flex gap-2 mb-4 sm:mb-8 border-b border-gray-200 bg-white rounded-t-lg px-3 sm:px-6 overflow-x-auto sticky top-0 z-20">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 sm:py-4 px-3 sm:px-6 font-medium border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'overview'
                ? 'border-yellow-600 text-yellow-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('trip')}
            className={`py-3 sm:py-4 px-3 sm:px-6 font-medium border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'trip'
                ? 'border-yellow-600 text-yellow-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Trip
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`py-3 sm:py-4 px-3 sm:px-6 font-medium border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'maintenance'
                ? 'border-yellow-600 text-yellow-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Maintenance
          </button>
        </div>

        {/* Content Grid - Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Main Content Area - Map */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-3 sm:p-4">
                  <h2 className="text-lg sm:text-xl font-semibold flex items-center text-gray-900 gap-2">
                    <FaMapMarkerAlt className="text-yellow-600 flex-shrink-0" />
                    <span className="truncate">Vehicle Location & Route</span>
                  </h2>
                </div>
                <div 
                  style={{ 
                    height: windowSize.width < 640 ? '250px' : windowSize.width < 1024 ? '350px' : '400px'
                  }}
                  className="p-2 sm:p-4"
                >
                  <MapContainer
                    center={currentLocation}
                    zoom={13}
                    style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
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
                        color="#3b82f6" 
                        weight={3}
                        opacity={0.7}
                      />
                    )}
                    
                    {/* Vehicle Marker */}
                    {vehicle && (
                      <Marker position={currentLocation} icon={vehicleIcon}>
                        <Popup>
                          <div className="text-xs sm:text-sm">
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
            )}

            {activeTab === 'trip' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Trip Information Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-3 sm:p-4">
                    <h2 className="text-lg sm:text-xl font-semibold flex items-center text-gray-900 gap-2">
                      <FaRoute className="text-blue-600 flex-shrink-0" />
                      <span className="truncate">Trip Details</span>
                    </h2>
                  </div>
                  <div className="p-4 sm:p-6">
                    {currentTrip ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                            <p className="text-xs sm:text-sm text-gray-600 font-medium">Status</p>
                            <p className="text-base sm:text-lg font-bold text-blue-600 capitalize mt-1">{currentTrip.status}</p>
                          </div>
                          <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                            <p className="text-xs sm:text-sm text-gray-600 font-medium">Trip Date</p>
                            <p className="text-base sm:text-lg font-bold text-green-600 mt-1">{new Date(currentTrip.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Route Information</h3>
                          <div className="space-y-3">
                            <div className="flex items-start gap-2 sm:gap-3">
                              <FaMapMarkerAlt className="text-green-600 mt-1 flex-shrink-0 text-sm sm:text-base" />
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-gray-600">Start Location</p>
                                <p className="font-medium text-gray-900 text-sm sm:text-base break-words">{currentTrip.start_location}</p>
                              </div>
                            </div>
                            {currentTrip.end_location && (
                              <div className="flex items-start gap-2 sm:gap-3">
                                <FaMapMarkerAlt className="text-red-600 mt-1 flex-shrink-0 text-sm sm:text-base" />
                                <div className="min-w-0">
                                  <p className="text-xs sm:text-sm text-gray-600">End Location</p>
                                  <p className="font-medium text-gray-900 text-sm sm:text-base break-words">{currentTrip.end_location}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Trip Timeline</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs sm:text-sm">
                              <p className="text-gray-600">Started</p>
                              <p className="font-medium text-gray-900">{new Date(currentTrip.created_at).toLocaleTimeString()}</p>
                            </div>
                            {currentTrip.end_time && (
                              <div className="flex justify-between text-xs sm:text-sm">
                                <p className="text-gray-600">Ended</p>
                                <p className="font-medium text-gray-900">{new Date(currentTrip.end_time).toLocaleTimeString()}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FaClock className="mx-auto text-3xl sm:text-4xl text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium text-sm sm:text-base">No active trip</p>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">Start a trip to begin tracking</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Trip Statistics */}
                {currentTrip && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-3 sm:p-4">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Trip Statistics</h3>
                    </div>
                    <div className="p-4 sm:p-6 space-y-2 sm:space-y-3">
                      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100 p-3 sm:p-4 rounded-lg text-sm sm:text-base">
                        <p className="text-gray-700 font-medium">Total Distance</p>
                        <p className="text-xl sm:text-2xl font-bold text-blue-600">{tripDistance.toFixed(2)} km</p>
                      </div>
                      <div className="flex justify-between items-center bg-gradient-to-r from-green-50 to-green-100 p-3 sm:p-4 rounded-lg text-sm sm:text-base">
                        <p className="text-gray-700 font-medium">Trip Duration</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-600">{tripDuration}</p>
                      </div>
                      {tripDistance > 0 && (
                        <div className="flex justify-between items-center bg-gradient-to-r from-orange-50 to-orange-100 p-3 sm:p-4 rounded-lg text-sm sm:text-base">
                          <p className="text-gray-700 font-medium">Avg. Speed</p>
                          <p className="text-xl sm:text-2xl font-bold text-orange-600">
                            {tripDuration && currentTrip ? 
                              (tripDistance / ((new Date() - new Date(currentTrip.created_at)) / 3600000)).toFixed(2) 
                              : '0.00'
                            } km/h
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'maintenance' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Maintenance Panel */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-3 sm:p-4">
                    <h2 className="text-lg sm:text-xl font-semibold flex items-center text-gray-900 gap-2">
                      <FaClipboardList className="text-yellow-600 flex-shrink-0" />
                      <span className="truncate">Vehicle Maintenance Check</span>
                    </h2>
                  </div>
                  <div className="p-4 sm:p-6">
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">Perform a pre-trip or safety inspection of your vehicle.</p>
                    <button
                      onClick={() => setShowInspection(true)}
                      disabled={!vehicle || !driverId}
                      className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:from-yellow-700 hover:to-yellow-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold transition-all shadow-md hover:shadow-lg text-sm sm:text-base gap-2"
                    >
                      <FaClipboardList />
                      <span className="hidden sm:inline">Start Vehicle Inspection</span>
                      <span className="sm:hidden">Start Inspection</span>
                    </button>
                    <p className="text-xs text-gray-500 mt-3">
                      Check brakes, tires, lights, engine, oil, mirrors & horn
                    </p>
                  </div>
                </div>

                {/* Issue Reporting Panel */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-3 sm:p-4">
                    <h2 className="text-lg sm:text-xl font-semibold flex items-center text-gray-900 gap-2">
                      <FaExclamationTriangle className="text-red-600 flex-shrink-0" />
                      <span className="truncate">Report Safety Issues</span>
                    </h2>
                  </div>
                  <div className="p-4 sm:p-6">
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">Report any problems or concerns with your vehicle.</p>
                    <button
                      onClick={() => setShowIssueReport(true)}
                      disabled={!vehicle || !driverId}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold transition-all shadow-md hover:shadow-lg text-sm sm:text-base gap-2"
                    >
                      <FaExclamationTriangle />
                      <span className="hidden sm:inline">Report a Problem</span>
                      <span className="sm:hidden">Report Issue</span>
                    </button>
                    <p className="text-xs text-gray-500 mt-3">
                      Include details and photos of the issue
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Collapsible on Mobile */}
          <div className={`space-y-4 sm:space-y-6 ${windowSize.width < 1024 ? 'col-span-1' : 'col-span-1'}`}>
            {/* Vehicle Information Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-3 sm:p-4">
                <h3 className="font-semibold flex items-center text-gray-900 gap-2 text-sm sm:text-base">
                  <FaCar className="text-yellow-600 flex-shrink-0" />
                  <span className="truncate">Assigned Vehicle</span>
                </h3>
              </div>
              <div className="p-4 sm:p-6">
                {vehicle ? (
                  <div className="space-y-2 sm:space-y-3">
                    <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Vehicle</p>
                      <p className="text-base sm:text-lg font-bold text-gray-900 mt-1 truncate">{vehicle.make} {vehicle.model}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                        <p className="text-xs text-gray-600">License</p>
                        <p className="font-bold text-blue-600 text-xs sm:text-sm mt-1 truncate">{vehicle.license_plate}</p>
                      </div>
                      <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Status</p>
                        <p className="font-bold text-green-600 text-xs sm:text-sm mt-1 capitalize">{vehicle.status}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4 text-sm">No vehicle assigned</p>
                )}
              </div>
            </div>

            {/* Trip Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-3 sm:p-4">
                <h3 className="font-semibold flex items-center text-gray-900 gap-2 text-sm sm:text-base">
                  <FaClock className="text-yellow-600 flex-shrink-0" />
                  <span className="truncate">Trip Controls</span>
                </h3>
              </div>
              <div className="p-4 sm:p-6 space-y-2 sm:space-y-3">
                {!currentTrip ? (
                  <button
                    onClick={startTrip}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:from-green-700 hover:to-green-800 flex items-center justify-center font-semibold transition-all shadow-md hover:shadow-lg text-sm sm:text-base gap-2"
                  >
                    <FaPlay className="flex-shrink-0" />
                    <span className="hidden sm:inline">Start New Trip</span>
                    <span className="sm:hidden">Start Trip</span>
                  </button>
                ) : (
                  <button
                    onClick={endTrip}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:from-red-700 hover:to-red-800 flex items-center justify-center font-semibold transition-all shadow-md hover:shadow-lg text-sm sm:text-base gap-2"
                  >
                    <FaStop className="flex-shrink-0" />
                    <span className="hidden sm:inline">End Current Trip</span>
                    <span className="sm:hidden">End Trip</span>
                  </button>
                )}
                
                <div className="border-t pt-2 sm:pt-3">
                  <p className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">GPS Tracking</p>
                  {!watchId ? (
                    <button
                      onClick={startGPSTracking}
                      className="w-full bg-blue-600 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-blue-700 font-medium transition-colors text-xs sm:text-sm"
                    >
                      Start Tracking
                    </button>
                  ) : (
                    <button
                      onClick={stopGPSTracking}
                      className="w-full bg-gray-600 text-white py-2 px-3 sm:px-4 rounded-lg hover:bg-gray-700 font-medium transition-colors text-xs sm:text-sm"
                    >
                      Stop Tracking
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-3 sm:p-4">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Quick Actions</h3>
              </div>
              <div className="p-3 sm:p-6 space-y-1 sm:space-y-2">
                <button
                  onClick={() => { setShowInspection(true); setActiveTab('maintenance'); }}
                  className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-yellow-50 transition-colors flex items-center text-gray-700 hover:text-yellow-700 font-medium text-sm sm:text-base gap-2"
                >
                  <FaClipboardList className="text-yellow-600 flex-shrink-0" />
                  <span className="truncate">Run Inspection</span>
                </button>
                <button
                  onClick={() => { setShowIssueReport(true); setActiveTab('maintenance'); }}
                  className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-red-50 transition-colors flex items-center text-gray-700 hover:text-red-700 font-medium text-sm sm:text-base gap-2"
                >
                  <FaExclamationTriangle className="text-red-600 flex-shrink-0" />
                  <span className="truncate">Report Issue</span>
                </button>
              </div>
            </div>

            {/* Help/Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4 sm:p-6">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Need Help?</h4>
              <p className="text-xs sm:text-sm text-blue-800 mb-3">
                Use the tabs to navigate between different sections.
              </p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Overview: Vehicle location</li>
                <li>• Trip: Trip details</li>
                <li>• Maintenance: Inspections</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Inspection Modal */}
        {showInspection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
            <div className="my-4 sm:my-8 w-full max-w-2xl">
              <VehicleInspectionChecklist
                vehicleId={vehicle?.id}
                driverId={driverId}
                onSubmit={handleInspectionSubmit}
                onCancel={() => setShowInspection(false)}
              />
            </div>
          </div>
        )}

        {/* Issue Report Modal */}
        {showIssueReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
            <div className="my-4 sm:my-8 w-full max-w-2xl">
              <ManualIssueReport
                vehicleId={vehicle?.id}
                driverId={driverId}
                onSubmit={handleIssueSubmit}
                onCancel={() => setShowIssueReport(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}