<?php

namespace App\Http\Controllers;

use App\Models\PaymentSimulation;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaymentSimulationController extends Controller
{
    /**
     * Display payment simulations for the authenticated company.
     */
    public function index()
    {
        $user = Auth::user();
        if (!$user || !$user->company_id) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $simulations = PaymentSimulation::where('company_id', $user->company_id)
            ->with('subscription.plan')
            ->latest()
            ->get();
        
        return response()->json($simulations);
    }

    /**
     * Create a new payment simulation.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user || !$user->company_id) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'subscription_id' => 'required|exists:subscriptions,id',
            'simulated_vehicles' => 'required|integer|min:0',
            'simulated_drivers' => 'required|integer|min:0',
            'simulated_users' => 'required|integer|min:0',
            'simulated_amount' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string',
            'payment_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        // Verify subscription belongs to user's company
        $subscription = Subscription::findOrFail($validated['subscription_id']);
        if ($subscription->company_id != $user->company_id) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Create payment simulation
        $simulation = PaymentSimulation::create([
            'company_id' => $user->company_id,
            'subscription_id' => $validated['subscription_id'],
            'simulated_vehicles' => $validated['simulated_vehicles'],
            'simulated_drivers' => $validated['simulated_drivers'],
            'simulated_users' => $validated['simulated_users'],
            'simulated_amount' => $validated['simulated_amount'] ?? $subscription->plan->price,
            'payment_method' => $validated['payment_method'] ?? 'credit_card',
            'payment_date' => $validated['payment_date'] ?? now(),
            'due_date' => $validated['due_date'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'payment_status' => 'pending',
        ]);

        // Check if simulation exceeds plan limits
        if ($simulation->exceedsLimits()) {
            return response()->json([
                'message' => 'Simulated values exceed plan limits',
                'errors' => $simulation->getLimitErrors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Payment simulation created successfully',
            'simulation' => $simulation->load('subscription.plan')
        ], 201);
    }

    /**
     * Display the specified payment simulation.
     */
    public function show(string $id)
    {
        $simulation = PaymentSimulation::findOrFail($id);

        // Check authorization
        $user = Auth::user();
        if (!$user || $user->company_id != $simulation->company_id) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return response()->json($simulation->load('subscription.plan'));
    }

    /**
     * Update the specified payment simulation.
     */
    public function update(Request $request, string $id)
    {
        $simulation = PaymentSimulation::findOrFail($id);

        // Check authorization
        $user = Auth::user();
        if (!$user || $user->company_id != $simulation->company_id) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'simulated_vehicles' => 'nullable|integer|min:0',
            'simulated_drivers' => 'nullable|integer|min:0',
            'simulated_users' => 'nullable|integer|min:0',
            'simulated_amount' => 'nullable|numeric|min:0',
            'payment_status' => 'nullable|in:pending,completed,failed',
            'payment_method' => 'nullable|string',
            'payment_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $simulation->update($validated);

        // Check if updated simulation exceeds plan limits
        if ($simulation->exceedsLimits()) {
            return response()->json([
                'message' => 'Simulated values exceed plan limits',
                'errors' => $simulation->getLimitErrors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Payment simulation updated successfully',
            'simulation' => $simulation->load('subscription.plan')
        ]);
    }

    /**
     * Delete the specified payment simulation.
     */
    public function destroy(string $id)
    {
        $simulation = PaymentSimulation::findOrFail($id);

        // Check authorization
        $user = Auth::user();
        if (!$user || $user->company_id != $simulation->company_id) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $simulation->delete();

        return response()->json([
            'message' => 'Payment simulation deleted successfully'
        ]);
    }

    /**
     * Get payment simulations for a specific subscription.
     */
    public function getBySubscription(string $subscriptionId)
    {
        $user = Auth::user();
        if (!$user || !$user->company_id) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $subscription = Subscription::findOrFail($subscriptionId);
        if ($subscription->company_id != $user->company_id) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $simulations = PaymentSimulation::where('subscription_id', $subscriptionId)
            ->with('subscription.plan')
            ->latest()
            ->get();

        return response()->json($simulations);
    }

    /**
     * Process payment simulation (mark as completed).
     */
    public function processPayment(Request $request, string $id)
    {
        $simulation = PaymentSimulation::findOrFail($id);

        // Check authorization
        $user = Auth::user();
        if (!$user || $user->company_id != $simulation->company_id) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Validate payment details
        $validated = $request->validate([
            'payment_method' => 'required|string',
            'payment_date' => 'required|date',
        ]);

        // Update simulation with payment details
        $simulation->update([
            'payment_status' => 'completed',
            'payment_method' => $validated['payment_method'],
            'payment_date' => $validated['payment_date'],
        ]);

        // If payment is completed, allow the company to add resources up to the simulated limits
        // This would be handled in the frontend to actually create vehicles/drivers/users

        return response()->json([
            'message' => 'Payment processed successfully',
            'simulation' => $simulation->load('subscription.plan')
        ]);
    }
}
