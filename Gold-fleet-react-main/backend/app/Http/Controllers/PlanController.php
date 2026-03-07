<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    /**
     * Display a listing of all plans.
     */
    public function index()
    {
        return response()->json(
            Plan::where('status', 'active')->get()
        );
    }

    /**
     * Store a newly created plan in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:plans',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'trial_days' => 'required|integer|min:0',
            'max_vehicles' => 'nullable|integer|min:1',
            'max_drivers' => 'nullable|integer|min:1',
            'max_users' => 'nullable|integer|min:1',
            'has_analytics' => 'boolean',
            'has_map_tracking' => 'boolean',
            'has_maintenance_tracking' => 'boolean',
            'has_expense_tracking' => 'boolean',
        ]);

        $plan = Plan::create($validated);

        return response()->json([
            'message' => 'Plan created successfully',
            'plan' => $plan
        ], 201);
    }

    /**
     * Display the specified plan.
     */
    public function show(string $id)
    {
        $plan = Plan::findOrFail($id);
        return response()->json($plan);
    }

    /**
     * Update the specified plan in storage.
     */
    public function update(Request $request, string $id)
    {
        $plan = Plan::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|unique:plans,name,' . $id,
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'trial_days' => 'required|integer|min:0',
            'max_vehicles' => 'nullable|integer|min:1',
            'max_drivers' => 'nullable|integer|min:1',
            'max_users' => 'nullable|integer|min:1',
            'has_analytics' => 'boolean',
            'has_map_tracking' => 'boolean',
            'has_maintenance_tracking' => 'boolean',
            'has_expense_tracking' => 'boolean',
        ]);

        $plan->update($validated);

        return response()->json([
            'message' => 'Plan updated successfully',
            'plan' => $plan
        ]);
    }

    /**
     * Remove the specified plan from storage.
     */
    public function destroy(string $id)
    {
        $plan = Plan::findOrFail($id);
        $plan->update(['status' => 'inactive']);

        return response()->json([
            'message' => 'Plan deleted successfully'
        ]);
    }
}
