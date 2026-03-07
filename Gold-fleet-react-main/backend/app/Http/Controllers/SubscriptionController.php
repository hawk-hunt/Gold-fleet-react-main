<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\Plan;
use App\Models\Company;
use App\Models\PaymentSimulation;
use App\Services\PaymentVerificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SubscriptionController extends Controller
{
    protected PaymentVerificationService $paymentService;

    public function __construct(PaymentVerificationService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Display subscriptions for the authenticated company.
     */
    public function index()
    {
        $user = Auth::user();
        if (!$user || !$user->company_id) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $subscriptions = Subscription::where('company_id', $user->company_id)->get();
        return response()->json($subscriptions);
    }

    /**
     * Create a subscription for a company during signup.
     */
    public function store(Request $request)
    {
        // Log incoming request
        error_log('Subscription store request: ' . json_encode($request->all()));
        
        // Get all plans for debugging
        $plansInDb = Plan::select('id', 'name', 'status')->get();
        error_log('Plans in database: ' . json_encode($plansInDb));
        
        try {
            $validated = $request->validate([
                'company_id' => 'required|integer|exists:companies,id',
                'plan_id' => 'required|integer|exists:plans,id',
            ]);
            
            error_log('Validation passed for subscription: ' . json_encode($validated));
        } catch (\Illuminate\Validation\ValidationException $e) {
            error_log('Subscription validation failed: ' . json_encode($e->errors()));
            
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
                'debug' => [
                    'received_data' => $request->all(),
                    'plans_in_database' => $plansInDb->toArray(),
                    'note' => 'Plan ID ' . $request->input('plan_id') . ' was not found in the database'
                ]
            ], 422);
        }

        try {
            // Use database transaction to ensure subscription creation is atomic
            $subscription = DB::transaction(function () use ($validated, $request) {
                $plan = Plan::findOrFail($validated['plan_id']);
                
                // Calculate trial end date
                $trialEndDate = now()->addDays($plan->trial_days);

                $subscription = Subscription::create([
                    'company_id' => $validated['company_id'],
                    'plan_id' => $validated['plan_id'],
                    'started_at' => now(),
                    'trial_ends_at' => $trialEndDate,
                    'expires_at' => null,
                    'status' => 'active',
                ]);

                // Create payment simulation from signup request
                if ($request->has('payment_data')) {
                    $paymentData = $request->input('payment_data');
                    
                    $payment = PaymentSimulation::create([
                        'company_id' => $validated['company_id'],
                        'subscription_id' => $subscription->id,
                        'simulated_amount' => $paymentData['simulated_amount'] ?? $plan->price,
                        'payment_method' => $paymentData['payment_method'] ?? 'credit_card_visa',
                        'payment_date' => $paymentData['payment_date'] ?? now(),
                        'card_number' => $paymentData['card_number'] ?? null,
                        'expiry_date' => $paymentData['expiry_date'] ?? null,
                        'cvc' => $paymentData['cvc'] ?? null,
                        'payment_status' => 'pending',
                    ]);

                    // Auto-verify the payment
                    $this->paymentService->verifyPayment($payment);
                }

                return $subscription;
            });

            return response()->json([
                'message' => 'Subscription created successfully',
                'subscription' => $subscription->load('plan')
            ], 201);
        } catch (\Exception $e) {
            error_log('Subscription creation error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create subscription: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified subscription.
     */
    public function show(string $id)
    {
        $subscription = Subscription::findOrFail($id);

        // Check authorization
        $user = Auth::user();
        if ($user && $user->company_id == $subscription->company_id) {
            return response()->json($subscription->load('plan'));
        }

        return response()->json(['message' => 'Unauthorized'], 401);
    }

    /**
     * Update the specified subscription (e.g., upgrade plan).
     */
    public function update(Request $request, string $id)
    {
        $subscription = Subscription::findOrFail($id);

        // Check authorization
        $user = Auth::user();
        if (!$user || $user->company_id != $subscription->company_id) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'plan_id' => 'nullable|exists:plans,id',
            'status' => 'nullable|in:active,cancelled,expired',
        ]);

        if (isset($validated['plan_id'])) {
            $subscription->plan_id = $validated['plan_id'];
        }

        if (isset($validated['status'])) {
            $subscription->status = $validated['status'];
        }

        $subscription->save();

        return response()->json([
            'message' => 'Subscription updated successfully',
            'subscription' => $subscription->load('plan')
        ]);
    }

    /**
     * Cancel the specified subscription.
     */
    public function destroy(string $id)
    {
        $subscription = Subscription::findOrFail($id);

        // Check authorization
        $user = Auth::user();
        if (!$user || $user->company_id != $subscription->company_id) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $subscription->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Subscription cancelled successfully'
        ]);
    }

    /**
     * Get the current active subscription for a company.
     */
    public function getCurrentSubscription()
    {
        $user = Auth::user();
        if (!$user || !$user->company_id) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $subscription = Subscription::where('company_id', $user->company_id)
            ->where('status', 'active')
            ->latest()
            ->first();

        return response()->json($subscription ? $subscription->load('plan') : null);
    }
}
