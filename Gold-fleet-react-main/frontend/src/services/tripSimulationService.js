/**
 * Trip Simulation Service
 * 
 * Handles all API calls related to trip simulation including:
 * - Creating trips with GPS coordinates
 * - Approving trips and starting simulations
 * - Updating vehicle locations
 * - Fetching trip data and simulation status
 * - Stopping simulations
 */

const API_BASE_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('auth_token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
  };
};

const apiCall = async (url, options = {}) => {
  const headers = { ...getAuthHeaders(), ...options.headers };

  try {
    const response = await fetch(url, { ...options, headers });

    // Try to parse JSON response
    let responseData = null;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      }
    } catch (e) {
      console.log('Could not parse response as JSON');
    }

    if (!response.ok) {
      let errorMessage = responseData?.error || responseData?.message || response.statusText;

      if (responseData?.errors) {
        const errors = Object.values(responseData.errors).flat();
        errorMessage = errors.join(', ');
      }

      console.error(`API error [${response.status}]:`, errorMessage);
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = responseData;
      throw error;
    }

    if (response.status === 204) {
      return { success: true };
    }

    return responseData || { success: true };
  } catch (error) {
    if (error instanceof TypeError) {
      // Network error
      console.error('Network error:', error.message);
      throw new Error('Network error - Backend may be unavailable. Make sure Laravel server is running on http://localhost:8000');
    }
    throw error;
  }
};

export const tripSimulationService = {
  /**
   * Create a new trip with GPS coordinates.
   * POST /api/trips-simulation
   */
  createTrip: (data) =>
    apiCall(`${API_BASE_URL}/trips-simulation`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Approve a trip and start simulation.
   * POST /api/trips/{tripId}/approve
   */
  approveTrip: (tripId) =>
    apiCall(`${API_BASE_URL}/trips/${tripId}/approve`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  /**
   * Update vehicle location during simulation.
   * POST /api/vehicle/location
   */
  updateLocation: (data) =>
    apiCall(`${API_BASE_URL}/vehicle/location`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * Get all locations for a trip (with route and simulation info).
   * GET /api/trips/{tripId}/locations
   */
  getTripLocations: (tripId) =>
    apiCall(`${API_BASE_URL}/trips/${tripId}/locations`),

  /**
   * Get simulation status for a trip.
   * GET /api/trips/{tripId}/simulation
   */
  getSimulationStatus: (tripId) =>
    apiCall(`${API_BASE_URL}/trips/${tripId}/simulation`),

  /**
   * Stop/complete a simulation.
   * POST /api/trips/{tripId}/simulation/stop
   */
  stopSimulation: (tripId) =>
    apiCall(`${API_BASE_URL}/trips/${tripId}/simulation/stop`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  /**
   * Get all active trips for the company dashboard.
   * GET /api/trips-simulation/company/active
   */
  getActiveTrips: () =>
    apiCall(`${API_BASE_URL}/trips-simulation/company/active`),

  /**
   * Get driver's assigned trip.
   * GET /api/driver/trip
   */
  getDriverTrip: () =>
    apiCall(`${API_BASE_URL}/driver/trip`),
};

export default tripSimulationService;
