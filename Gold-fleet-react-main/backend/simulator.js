#!/usr/bin/env node

/**
 * Trip Simulation Script
 * 
 * Runs vehicle movement simulation along predefined routes.
 * Updates vehicle locations every 3 seconds via API calls.
 * Can be run standalone with: node simulator.js
 * 
 * Features:
 * - Simulates vehicle movement from origin to destination
 * - Linear interpolation between coordinates
 * - Configurable speed and update interval
 * - Real-time API updates
 * - Handles multiple active simulations
 * - Graceful shutdown
 */

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

/**
 * Configuration
 */
const CONFIG = {
  API_BASE_URL: process.env.API_URL || 'http://localhost:8000/api',
  AUTH_TOKEN: process.env.AUTH_TOKEN || '', // Pass via environment variable
  UPDATE_INTERVAL: parseInt(process.env.UPDATE_INTERVAL || '3000', 10), // milliseconds
  SIMULATION_SPEED_KMH: parseInt(process.env.SPEED_KMH || '60', 10), // km/h
  CHECK_NEW_TRIPS_INTERVAL: parseInt(process.env.CHECK_INTERVAL || '30000', 10), // 30 seconds
};

/**
 * In-memory store for active simulations
 */
const activeSimulations = new Map();

/**
 * Calculate distance between two coordinates in kilometers.
 * Uses Haversine formula for accurate great-circle distances.
 * 
 * @param {number} lat1 - Start latitude
 * @param {number} lng1 - Start longitude
 * @param {number} lat2 - End latitude
 * @param {number} lng2 - End longitude
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate bearing (heading) from one point to another.
 * 
 * @param {number} lat1 - Start latitude
 * @param {number} lng1 - Start longitude
 * @param {number} lat2 - End latitude
 * @param {number} lng2 - End longitude
 * @returns {number} Bearing in degrees (0-360)
 */
function calculateBearing(lat1, lng1, lat2, lng2) {
  const dLng = lng2 - lng1;
  const y = Math.sin(dLng) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(dLng);
  let bearing = Math.atan2(y, x);
  bearing = ((bearing * 180) / Math.PI + 360) % 360;
  return bearing;
}

/**
 * Interpolate position between two points.
 * 
 * @param {number} lat1 - Start latitude
 * @param {number} lng1 - Start longitude
 * @param {number} lat2 - End latitude
 * @param {number} lng2 - End longitude
 * @param {number} progress - Progress percentage (0-1)
 * @returns {object} Interpolated position {lat, lng}
 */
function interpolatePosition(lat1, lng1, lat2, lng2, progress) {
  return {
    latitude: lat1 + (lat2 - lat1) * progress,
    longitude: lng1 + (lng2 - lng1) * progress,
  };
}

/**
 * Make API call with authentication.
 * 
 * @param {string} endpoint - API endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise<object>} API response
 */
async function apiCall(endpoint, options = {}) {
  const headers = {
    'Authorization': CONFIG.AUTH_TOKEN ? `Bearer ${CONFIG.AUTH_TOKEN}` : '',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...options.headers,
  };

  try {
    const response = await fetch(endpoint, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      console.error(`[API Error ${response.status}]`, data.message || response.statusText);
      throw new Error(data.message || response.statusText);
    }

    return data;
  } catch (error) {
    console.error('[API Call Failed]', error.message);
    throw error;
  }
}

/**
 * Update vehicle location via API.
 * 
 * @param {number} vehicleId - Vehicle ID
 * @param {number} lat - Current latitude
 * @param {number} lng - Current longitude
 * @param {number} speed - Current speed in km/h
 * @param {number} heading - Direction in degrees
 */
async function updateVehicleLocation(vehicleId, lat, lng, speed, heading) {
  try {
    const response = await apiCall(`${CONFIG.API_BASE_URL}/vehicle/location`, {
      method: 'POST',
      body: JSON.stringify({
        vehicle_id: vehicleId,
        lat: Number(lat.toFixed(8)),
        lng: Number(lng.toFixed(8)),
        speed: Number(speed.toFixed(2)),
        heading: Number(heading.toFixed(2)),
      }),
    });

    if (response.success) {
      console.log(`✓ Updated vehicle ${vehicleId}: [${lat.toFixed(6)}, ${lng.toFixed(6)}]`);
    }
  } catch (error) {
    console.error(`✗ Failed to update vehicle ${vehicleId}:`, error.message);
  }
}

/**
 * Run a single vehicle simulation step.
 * Advances vehicle along the route and updates API.
 * 
 * @param {string} tripId - Trip ID
 * @param {object} simulation - Simulation state object
 */
async function runSimulationStep(tripId, simulation) {
  const {
    vehicleId,
    tripData,
    startTime,
    totalDistance,
    routePoints,
  } = simulation;

  // Calculate elapsed time in seconds
  const elapsedSeconds = (Date.now() - startTime) / 1000;
  
  // Calculate distance traveled (km/h converted to km/s)
  const distanceTraveled = (CONFIG.SIMULATION_SPEED_KMH / 3.6) * elapsedSeconds, // Divide by 3.6 to convert km/h to km/s
  
  // Calculate progress (0-1)
  let progress = distanceTraveled / totalDistance;

  // If simulation is complete
  if (progress >= 1.0) {
    console.log(`✓ Trip ${tripId} simulation complete!`);
    
    // Update to final position
    const origin = tripData.origin;
    const destination = tripData.destination;
    
    await updateVehicleLocation(
      vehicleId,
      destination.latitude,
      destination.longitude,
      0, // Speed = 0 when stopped
      0
    );

    // Stop the simulation
    try {
      await apiCall(`${CONFIG.API_BASE_URL}/trips/${tripId}/simulation/stop`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      console.log(`✓ Stopped simulation for trip ${tripId}`);
    } catch (error) {
      console.error(`Failed to stop simulation for trip ${tripId}`);
    }

    // Remove from active simulations
    activeSimulations.delete(tripId);
    return;
  }

  // Interpolate position along route
  const { origin, destination } = tripData;
  const newPosition = interpolatePosition(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude,
    progress
  );

  // Calculate bearing (direction)
  const bearing = calculateBearing(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude
  );

  // Update simulation state
  simulation.currentPosition = newPosition;
  simulation.progress = progress;
  simulation.bearing = bearing;

  // Update vehicle location via API
  await updateVehicleLocation(
    vehicleId,
    newPosition.latitude,
    newPosition.longitude,
    CONFIG.SIMULATION_SPEED_KMH,
    bearing
  );
}

/**
 * Fetch active trips and start simulations for new ones.
 */
async function fetchAndStartNewSimulations() {
  try {
    const response = await apiCall(`${CONFIG.API_BASE_URL}/trips-simulation/company/active`);
    
    if (!response.success || !response.trips) {
      return;
    }

    response.trips.forEach(trip => {
      // Skip if already simulating
      if (activeSimulations.has(trip.id)) {
        return;
      }

      // Skip if not approved or already active
      if (trip.status !== 'approved' && trip.status !== 'active') {
        return;
      }

      // Skip if no simulation record exists
      if (!trip.simulation || !trip.simulation.is_active) {
        return;
      }

      console.log(`🚗 Starting simulation for trip ${trip.id} (${trip.vehicle?.name})`);

      // Calculate total distance
      const totalDistance = calculateDistance(
        trip.origin.latitude,
        trip.origin.longitude,
        trip.destination.latitude,
        trip.destination.longitude
      );

      // Create simulation state
      const simulation = {
        tripId: trip.id,
        vehicleId: trip.vehicle_id,
        tripData: {
          origin: trip.origin,
          destination: trip.destination,
        },
        startTime: Date.now(),
        totalDistance: totalDistance, // km
        progress: 0,
        currentPosition: trip.origin,
        bearing: 0,
      };

      activeSimulations.set(trip.id, simulation);
    });
  } catch (error) {
    console.error('Failed to fetch trips:', error.message);
  }
}

/**
 * Run all active simulations for one cycle.
 */
async function runSimulationCycle() {
  for (const [tripId, simulation] of activeSimulations.entries()) {
    try {
      await runSimulationStep(tripId, simulation);
    } catch (error) {
      console.error(`Error in simulation ${tripId}:`, error.message);
    }
  }
}

/**
 * Setup periodic tasks.
 */
function setupPeriodicTasks() {
  // Run simulation updates
  setInterval(runSimulationCycle, CONFIG.UPDATE_INTERVAL);
  console.log(`📍 Simulation updates every ${CONFIG.UPDATE_INTERVAL}ms`);

  // Check for new trips to simulate
  setInterval(fetchAndStartNewSimulations, CONFIG.CHECK_NEW_TRIPS_INTERVAL);
  console.log(`🔍 Checking for new trips every ${CONFIG.CHECK_NEW_TRIPS_INTERVAL}ms`);

  // Initial check
  fetchAndStartNewSimulations();
}

/**
 * Handle graceful shutdown.
 */
function setupGracefulShutdown() {
  const signals = ['SIGINT', 'SIGTERM'];
  
  signals.forEach(signal => {
    process.on(signal, async () => {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
      
      // Try to stop all active simulations
      for (const [tripId] of activeSimulations.entries()) {
        try {
          await apiCall(`${CONFIG.API_BASE_URL}/trips/${tripId}/simulation/stop`, {
            method: 'POST',
            body: JSON.stringify({}),
          });
          console.log(`✓ Stopped simulation for trip ${tripId}`);
        } catch (error) {
          console.error(`Failed to stop trip ${tripId}:`, error.message);
        }
      }
      
      activeSimulations.clear();
      console.log('👋 Simulator shut down');
      process.exit(0);
    });
  });
}

/**
 * Main entry point.
 */
async function main() {
  console.log('🚀 Trip Simulator Started');
  console.log('=========================');
  console.log(`API Base URL: ${CONFIG.API_BASE_URL}`);
  console.log(`Update Interval: ${CONFIG.UPDATE_INTERVAL}ms`);
  console.log(`Simulation Speed: ${CONFIG.SIMULATION_SPEED_KMH} km/h`);
  console.log(`Check New Trips: Every ${CONFIG.CHECK_NEW_TRIPS_INTERVAL}ms`);
  console.log('=========================\n');

  // Validate API token
  if (!CONFIG.AUTH_TOKEN) {
    console.warn('⚠️  Warning: No AUTH_TOKEN provided. Set AUTH_TOKEN environment variable.');
    console.warn('   This may cause API requests to fail if authentication is required.\n');
  }

  // Setup shutdown handler
  setupGracefulShutdown();

  // Start simulation
  setupPeriodicTasks();
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
