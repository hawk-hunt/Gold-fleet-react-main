<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\VehicleLocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class MapDashboardController extends Controller
{
    public function index()
    {
        $companyId = auth()->user()->company_id;
        $cacheKey = "map_dashboard_{$companyId}";

        // Cache for 2 minutes (shorter for map as data is more real-time)
        $data = Cache::remember($cacheKey, 120, function() use ($companyId) {
            // Get latest vehicle locations efficiently
            $latestLocations = VehicleLocation::whereHas('vehicle', function($query) use ($companyId) {
                $query->where('company_id', $companyId)->where('status', 'active');
            })
            ->select('id', 'vehicle_id', 'latitude', 'longitude', 'speed', 'recorded_at')
            ->with(['vehicle:id,make,model,license_plate,status'])
            ->orderByRaw('vehicle_id, recorded_at DESC')
            ->get()
            ->unique('vehicle_id')
            ->values();

            return [
                'vehicleLocations' => $latestLocations,
                'count' => $latestLocations->count(),
            ];
        });

        return response()->json($data);
    }

    public function getVehicleLocations()
    {
        $companyId = auth()->user()->company_id;
        $cacheKey = "vehicle_locations_{$companyId}";

        // Cache for 1 minute for frequent requests
        $locations = Cache::remember($cacheKey, 60, function() use ($companyId) {
            return VehicleLocation::whereHas('vehicle', function($query) use ($companyId) {
                $query->where('company_id', $companyId)->where('status', 'active');
            })
            ->select('id', 'vehicle_id', 'latitude', 'longitude', 'speed', 'recorded_at')
            ->with(['vehicle:id,make,model,license_plate,status'])
            ->orderByRaw('vehicle_id, recorded_at DESC')
            ->get()
            ->unique('vehicle_id')
            ->values();
        });

        return response()->json($locations);
    }

    public function storeVehicleLocation(Request $request)
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|integer',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'timestamp' => 'nullable|date',
        ]);

        $user = auth()->user();
        $driver = $user->driver;

        if (!$driver || $driver->vehicle_id != $validated['vehicle_id']) {
            return response()->json(['error' => 'Unauthorized to update this vehicle'], 403);
        }

        VehicleLocation::create([
            'vehicle_id' => $validated['vehicle_id'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'recorded_at' => $validated['timestamp'] ?? now(),
        ]);

        return response()->json(['success' => true]);
    }
}
