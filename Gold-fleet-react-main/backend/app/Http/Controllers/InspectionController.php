<?php

namespace App\Http\Controllers;

use App\Models\Inspection;
use App\Models\InspectionItem;
use App\Models\Issue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class InspectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $inspections = Inspection::with('vehicle', 'driver', 'driver.user', 'items')->get();
        return response()->json(['data' => $inspections]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return response()->json(['message' => 'Provide inspection details to create.']);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'vehicle_id' => 'required|integer|exists:vehicles,id',
                'driver_id' => 'required|integer|exists:drivers,id',
                'inspection_date' => 'required|date',
                'notes' => 'required|string|min:1',
                'result' => 'nullable|in:pass,fail,conditional_pass',
                'next_due_date' => 'nullable|date',
                'items' => 'nullable|array',
                'items.*.item_name' => 'required|string|in:brakes,tires,lights,engine,oil level,mirrors,horn',
                'items.*.status' => 'required|in:ok,fail',
                'items.*.notes' => 'nullable|string',
            ]);

            $validated['company_id'] = auth()->user()->company_id ?? 1;
            $validated['result'] = $validated['result'] ?? 'pending';
            $validated['status'] = $request->input('status', 'passed');

            $inspection = Inspection::create($validated);

            // Store inspection items
            if (!empty($validated['items'])) {
                foreach ($validated['items'] as $item) {
                    InspectionItem::create([
                        'inspection_id' => $inspection->id,
                        'item_name' => $item['item_name'],
                        'status' => $item['status'],
                        'notes' => $item['notes'] ?? null,
                    ]);

                    // Create issue if item failed
                    if ($item['status'] === 'fail') {
                        Issue::create([
                            'company_id' => $validated['company_id'],
                            'vehicle_id' => $inspection->vehicle_id,
                            'driver_id' => $inspection->driver_id,
                            'title' => "Inspection Failed: {$item['item_name']}",
                            'description' => $item['notes'] ?? "Vehicle inspection identified a problem with {$item['item_name']}",
                            'severity' => 'medium',
                            'priority' => 'high',
                            'status' => 'open',
                            'reported_date' => now(),
                        ]);
                    }
                }
                
                // Update inspection status based on items
                $failedItems = collect($validated['items'])->filter(fn($item) => $item['status'] === 'fail');
                if ($failedItems->count() > 0) {
                    $inspection->update(['result' => 'fail', 'status' => 'failed']);
                }
            }

            return response()->json(['data' => $inspection->load('vehicle', 'driver', 'items')], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Inspection store error: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'exception' => $e,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create inspection: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Inspection $inspection)
    {
        return response()->json(['data' => $inspection->load('vehicle', 'driver', 'driver.user', 'items')]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Inspection $inspection)
    {
        return response()->json(['data' => $inspection->load('vehicle', 'driver', 'driver.user', 'items')]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Inspection $inspection)
    {
        try {
            $validated = $request->validate([
                'vehicle_id' => 'required|integer|exists:vehicles,id',
                'driver_id' => 'required|integer|exists:drivers,id',
                'inspection_date' => 'required|date',
                'notes' => 'required|string|min:1',
                'result' => 'nullable|in:pass,fail,conditional_pass',
                'next_due_date' => 'nullable|date',
                'items' => 'nullable|array',
                'items.*.item_name' => 'required|string|in:brakes,tires,lights,engine,oil level,mirrors,horn',
                'items.*.status' => 'required|in:ok,fail',
                'items.*.notes' => 'nullable|string',
            ]);

            $validated['status'] = $request->input('status', 'passed');

            $inspection->update($validated);

            // Update inspection items
            if (!empty($validated['items'])) {
                // Delete existing items
                $inspection->items()->delete();

                // Create new items
                foreach ($validated['items'] as $item) {
                    InspectionItem::create([
                        'inspection_id' => $inspection->id,
                        'item_name' => $item['item_name'],
                        'status' => $item['status'],
                        'notes' => $item['notes'] ?? null,
                    ]);
                }

                // Update inspection result based on items
                $failedItems = collect($validated['items'])->filter(fn($item) => $item['status'] === 'fail');
                if ($failedItems->count() > 0) {
                    $inspection->update(['result' => 'fail', 'status' => 'failed']);
                } else {
                    $inspection->update(['result' => 'pass', 'status' => 'passed']);
                }
            }

            return response()->json(['data' => $inspection->load('vehicle', 'driver', 'driver.user', 'items')]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Inspection update error: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'inspection_id' => $inspection->id,
                'exception' => $e,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update inspection: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Inspection $inspection)
    {
        try {
            $inspection->delete();
            return response()->json(['success' => true, 'message' => 'Inspection deleted successfully.']);
        } catch (\Exception $e) {
            Log::error('Inspection delete error: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'inspection_id' => $inspection->id,
                'exception' => $e,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete inspection: ' . $e->getMessage(),
            ], 500);
        }
    }
}
