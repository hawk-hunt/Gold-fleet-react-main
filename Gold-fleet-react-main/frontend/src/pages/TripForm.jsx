import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaRoad, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../services/api';
import { ModernFormLayout, ModernTextInput, ModernSelectInput, FormFieldGroup } from '../components/ModernFormLayout';

// Haversine distance calculation
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Geocode location name to coordinates using backend
const geocodeLocation = async (locationString) => {
  if (!locationString) return null;
  
  try {
    const response = await api.geocode(locationString);
    
    if (response.success && response.data && response.data.length > 0) {
      const firstResult = response.data[0];
      return {
        name: firstResult.name || locationString,
        lat: firstResult.lat,
        lon: firstResult.lon,
      };
    }
  } catch (err) {
    console.error('Geocoding error:', err);
  }
  return null;
};

// Location Picker Component
function LocationPicker({ label, value, location, onLocationChange, onCoordinatesChange }) {
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const mapRef = useRef(null);
  const searchResultsRef = useRef(null);

  // Sync searchQuery with value prop when it changes
  useEffect(() => {
    setSearchQuery(value || '');
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(e.target)) {
        setSearchResults([]);
      }
    };

    if (searchResults.length > 0) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [searchResults]);

  // Force map to render when showMap changes or location changes
  useEffect(() => {
    if (showMap) {
      // Delay to ensure DOM is updated
      const timer = setTimeout(() => {
        // Trigger map resize if it exists
        const mapElement = document.querySelector('.leaflet-container');
        if (mapElement && mapElement._leaflet_map) {
          mapElement._leaflet_map.invalidateSize();
          // If location exists, center on it with zoom 15, otherwise use default
          if (location && location.lat) {
            mapElement._leaflet_map.setView(
              [parseFloat(location.lat), parseFloat(location.lon)], 
              15
            );
          }
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showMap, location]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      // Clear location when search is cleared
      onLocationChange('');
      onCoordinatesChange(null);
      return;
    }

    setSearching(true);
    try {
      const response = await api.geocode(query);
      console.log('Geocode response:', response);
      
      if (response.success && response.data && Array.isArray(response.data)) {
        setSearchResults(response.data);
      } else if (Array.isArray(response)) {
        // Handle case where response is directly an array
        setSearchResults(response);
      } else {
        console.warn('Unexpected response format:', response);
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectResult = (result) => {
    const locationObj = {
      name: result.name || result.display_name || 'Location',
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
    };
    // Update to show the selected location name in the input
    setSearchQuery(locationObj.name);
    onLocationChange(locationObj.name);
    onCoordinatesChange(locationObj);
    setSearchResults([]);
    setShowMap(false);
    console.log('Selected location:', locationObj);
  };

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    try {
      // Reverse geocode to get location name using backend
      const response = await api.reverseGeocode(lat, lng);
      if (response.success && response.data) {
        const locationObj = {
          name: response.data.name,
          lat,
          lon: lng,
        };
        onLocationChange(locationObj.name);
        onCoordinatesChange(locationObj);
        setShowMap(false);
      }
    } catch (err) {
      console.error('Reverse geocode error:', err);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label} *</label>
      <div className="space-y-2">
        {/* Search Input */}
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder={`Search for ${label.toLowerCase()}...`}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                autoComplete="off"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setShowMap(!showMap);
                setSearchResults([]);
              }}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center gap-2"
            >
              <FaMapMarkerAlt /> Map
            </button>
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div 
              ref={searchResultsRef} 
              className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-yellow-300 rounded-lg shadow-2xl z-[9999] max-h-80 overflow-y-auto"
              style={{ 
                pointerEvents: 'auto',
                minWidth: '100%'
              }}
            >
              {searching ? (
                <div className="p-4 text-center text-gray-500 font-medium">Searching locations...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-gray-400">No results found</div>
              ) : (
                searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectResult(result)}
                    className="w-full text-left px-4 py-3 hover:bg-yellow-100 active:bg-yellow-200 border-b border-gray-100 last:border-b-0 text-sm flex items-start gap-3 transition-all duration-100"
                  >
                    <FaMapMarkerAlt className="text-yellow-600 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{result.name || result.display_name}</p>
                      <p className="text-xs text-gray-500 truncate">{result.type || 'Location'}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Display Selected Location */}
        {location && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm font-medium text-yellow-900">Selected:</p>
            <p className="text-sm text-yellow-800">
              {typeof location === 'object' ? location.name : location}
            </p>
            {typeof location === 'object' && location.lat && (
              <p className="text-xs text-yellow-700">
                Lat: {parseFloat(location.lat).toFixed(4)}, Lon: {parseFloat(location.lon).toFixed(4)}
              </p>
            )}
          </div>
        )}

        {/* Map Selector */}
        {showMap && (
          <div className="mt-4 border-2 border-yellow-300 rounded-md overflow-hidden bg-white shadow-lg">
            {/* Map Instructions */}
            <div className="bg-yellow-50 border-b border-yellow-200 p-3 flex items-start gap-2">
              <FaMapMarkerAlt className="text-yellow-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-yellow-900">Click on the map to select {label.toLowerCase()}</p>
                <p className="text-xs text-yellow-700">The location will be automatically detected from the coordinates</p>
              </div>
            </div>
            {/* Map Container */}
            <div style={{ width: '100%', height: '500px', position: 'relative' }}>
              <MapContainer
                center={location && location.lat ? [location.lat, location.lon] : [5.6037, -0.1870]}
                zoom={location && location.lat ? 15 : 7}
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                {location && location.lat && (
                  <Marker position={[parseFloat(location.lat), parseFloat(location.lon)]}>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">{location.name}</p>
                        <p className="text-xs text-gray-600">
                          {parseFloat(location.lat).toFixed(4)}, {parseFloat(location.lon).toFixed(4)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                )}
                <ClickableMap onClick={handleMapClick} />
              </MapContainer>
            </div>
            {/* Map Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowMap(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close Map
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component to handle map clicks using proper Leaflet event handling
function ClickableMap({ onClick }) {
  useMapEvents({
    click: (e) => {
      onClick(e);
    },
  });
  return null;
}

export default function TripForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  
  const [formData, setFormData] = useState({
    vehicle_id: '',
    driver_id: '',
    start_location: '',
    end_location: '',
    start_time: new Date().toISOString().slice(0, 16),
    end_time: '',
    start_mileage: '',
    end_mileage: '',
    distance: '',
    trip_date: new Date().toISOString().split('T')[0],
    status: 'planned',
  });

  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);

  useEffect(() => {
    fetchVehiclesAndDrivers();
    if (id) {
      fetchTrip();
    }
  }, [id]);

  // Auto-calculate distance when both coordinates are set
  useEffect(() => {
    if (startCoords && endCoords) {
      const distance = calculateDistance(startCoords.lat, startCoords.lon, endCoords.lat, endCoords.lon);
      setFormData(prev => ({ ...prev, distance: distance.toFixed(2) }));
    }
  }, [startCoords, endCoords]);

  // Auto-set start_mileage when vehicle is selected
  useEffect(() => {
    if (formData.vehicle_id) {
      const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.vehicle_id));
      if (selectedVehicle && selectedVehicle.mileage && !id) {
        // Only auto-fill on create (not edit)
        setFormData(prev => ({
          ...prev,
          start_mileage: selectedVehicle.mileage.toString()
        }));
      }
    }
  }, [formData.vehicle_id, vehicles, id]);

  // Auto-calculate end_mileage when distance is set
  useEffect(() => {
    if (formData.start_mileage && formData.distance) {
      const startMileage = parseFloat(formData.start_mileage);
      const distance = parseFloat(formData.distance);
      if (!isNaN(startMileage) && !isNaN(distance)) {
        const calculatedEndMileage = (startMileage + distance).toFixed(2);
        setFormData(prev => ({
          ...prev,
          end_mileage: calculatedEndMileage
        }));
      }
    }
  }, [formData.start_mileage, formData.distance]);

  const fetchVehiclesAndDrivers = async () => {
    try {
      const [vehiclesRes, driversRes] = await Promise.all([
        api.getVehicles(),
        api.getDrivers(),
      ]);
      setVehicles(vehiclesRes.data || []);
      setDrivers(driversRes.data || []);
    } catch (err) {
      setError('Failed to load vehicles and drivers');
    }
  };

  const fetchTrip = async () => {
    try {
      const trip = await api.getTrip(id);
      if (trip) {
        const tripData = trip.data || trip;
        const safeData = {
          vehicle_id: tripData.vehicle_id ?? '',
          driver_id: tripData.driver_id ?? '',
          start_location: tripData.start_location ?? '',
          end_location: tripData.end_location ?? '',
          start_time: tripData.start_time ?? new Date().toISOString().slice(0, 16),
          end_time: tripData.end_time ?? '',
          start_mileage: tripData.start_mileage ?? '',
          end_mileage: tripData.end_mileage ?? '',
          distance: tripData.distance ?? '',
          trip_date: tripData.trip_date ?? new Date().toISOString().split('T')[0],
          status: tripData.status ?? 'planned',
        };
        setFormData(safeData);

        // Load coordinates if locations exist
        if (tripData.start_location) {
          const startGeo = await geocodeLocation(tripData.start_location);
          if (startGeo) setStartCoords(startGeo);
        }
        if (tripData.end_location) {
          const endGeo = await geocodeLocation(tripData.end_location);
          if (endGeo) setEndCoords(endGeo);
        }
      }
    } catch (err) {
      setError('Failed to load trip');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Format time to Y-m-d\TH:i format (remove seconds if present)
      const formatTimeForBackend = (timeString) => {
        if (!timeString) return '';
        // Handle both ISO format and datetime-local format
        if (timeString.includes('T')) {
          // Remove seconds if present - just keep YYYY-MM-DDTHH:MM
          return timeString.substring(0, 16);
        }
        return timeString;
      };

      // Create a copy of formData with properly formatted times
      const submitData = {
        ...formData,
        start_time: formatTimeForBackend(formData.start_time),
        end_time: formatTimeForBackend(formData.end_time),
      };

      if (id) {
        await api.updateTrip(id, submitData);
      } else {
        await api.createTrip(submitData);
      }
      navigate('/trips');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save trip');
    } finally {
      setLoading(false);
    }
  };

  const leftBlock = (
    <FormFieldGroup>
      <ModernSelectInput
        label="Vehicle"
        name="vehicle_id"
        value={formData.vehicle_id ?? ''}
        onChange={handleChange}
        options={[
          { value: '', label: 'Select a vehicle' },
          ...vehicles.map((v) => ({
            value: v.id,
            label: `${v.make} ${v.model} (${v.license_plate})`
          }))
        ]}
        required
      />
      <ModernSelectInput
        label="Driver"
        name="driver_id"
        value={formData.driver_id ?? ''}
        onChange={handleChange}
        options={[
          { value: '', label: 'Select a driver' },
          ...drivers.map((d) => ({
            value: d.id,
            label: d.user?.name || d.name || 'Unknown Driver'
          }))
        ]}
        required
      />
      <ModernTextInput
        label="Start Time"
        name="start_time"
        type="datetime-local"
        value={formData.start_time ?? ''}
        onChange={handleChange}
        required
      />
      <ModernTextInput
        label="End Time"
        name="end_time"
        type="datetime-local"
        value={formData.end_time ?? ''}
        onChange={handleChange}
      />
      <ModernTextInput
        label="Start Mileage (km)"
        name="start_mileage"
        type="number"
        value={formData.start_mileage ?? ''}
        onChange={handleChange}
        step="0.01"
        required
        helperText="Auto-filled from vehicle's current mileage"
      />
      <ModernTextInput
        label="End Mileage (km)"
        name="end_mileage"
        type="number"
        value={formData.end_mileage ?? ''}
        onChange={handleChange}
        step="0.01"
        helperText="Auto-calculated from distance (editable)"
      />
      <ModernTextInput
        label="Trip Date"
        name="trip_date"
        type="date"
        value={formData.trip_date ?? ''}
        onChange={handleChange}
        required
      />
    </FormFieldGroup>
  );

  const rightBlock = (
    <FormFieldGroup>
      <LocationPicker
        label="Start Location"
        value={formData.start_location}
        location={startCoords}
        onLocationChange={(location) => setFormData(prev => ({ ...prev, start_location: location }))}
        onCoordinatesChange={setStartCoords}
      />
      
      <LocationPicker
        label="End Location"
        value={formData.end_location}
        location={endCoords}
        onLocationChange={(location) => setFormData(prev => ({ ...prev, end_location: location }))}
        onCoordinatesChange={setEndCoords}
      />

      <ModernTextInput
        label="Calculated Distance (km)"
        name="distance"
        type="number"
        value={formData.distance ?? ''}
        readOnly
        disabled
        step="0.01"
        helperText="Auto-calculated from coordinates if available"
      />

      <ModernSelectInput
        label="Status"
        name="status"
        value={formData.status ?? 'planned'}
        onChange={handleChange}
        options={[
          { value: 'planned', label: 'Planned' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' }
        ]}
      />
    </FormFieldGroup>
  );

  return (
    <ModernFormLayout
      title={id ? 'Edit Trip' : 'Add New Trip'}
      subtitle="Manage trip information and details"
      icon={FaRoad}
      isEditing={!!id}
      isLoading={loading}
      error={error}
      onSubmit={handleSubmit}
      backUrl="/trips"
      leftBlock={leftBlock}
      rightBlock={rightBlock}
    />
  );
}
