<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\Subscription;
use App\Models\Company;
use App\Models\PaymentSimulation;
use Illuminate\Http\Request;

class SubscriptionManagementController extends Controller
{
    /**
     * Get all subscriptions for platform admin with company and plan details
     */
    public function index()
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'platform_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $subscriptions = Subscription::with(['company', 'plan'])
            ->paginate(10);

        return response()->json([
            'data' => $subscriptions->items(),
            'pagination' => [
                'current_page' => $subscriptions->currentPage(),
                'per_page' => $subscriptions->perPage(),
                'total' => $subscriptions->total(),
                'last_page' => $subscriptions->lastPage(),
            ]
        ]);
    }

    /**
     * Get single subscription with payment simulations
     */
    public function show($id)
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'platform_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $subscription = Subscription::with(['company', 'plan', 'paymentSimulations'])->findOrFail($id);

        return response()->json([
            'subscription' => $subscription,
            'payment_simulations' => $subscription->paymentSimulations,
            'trial_info' => [
                'is_in_trial' => $subscription->isInTrial(),
                'trial_ends_at' => $subscription->trial_ends_at,
                'trial_ended' => $subscription->trial_ends_at && now() > $subscription->trial_ends_at,
            ]
        ]);
    }

    /**
     * Activate a subscription
     */
    public function activate($id)
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'platform_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $subscription = Subscription::findOrFail($id);

        $subscription->update([
            'status' => 'active',
        ]);

        // Also activate the company
        $subscription->company->update([
            'subscription_status' => 'active',
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Subscription activated successfully',
            'subscription' => $subscription->load(['company', 'plan'])
        ]);
    }

    /**
     * Deactivate a subscription
     */
    public function deactivate($id)
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'platform_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $subscription = Subscription::findOrFail($id);

        $subscription->update([
            'status' => 'cancelled',
        ]);

        // Also deactivate the company
        $subscription->company->update([
            'subscription_status' => 'cancelled',
            'is_active' => false,
        ]);

        return response()->json([
            'message' => 'Subscription deactivated successfully',
            'subscription' => $subscription->load(['company', 'plan'])
        ]);
    }

    /**
     * Suspend a subscription (temporary disable)
     */
    public function suspend($id)
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'platform_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $subscription = Subscription::findOrFail($id);

        $subscription->update([
            'status' => 'suspended',
        ]);

        // Also mark company as inactive but don't change subscription_status
        $subscription->company->update([
            'is_active' => false,
        ]);

        return response()->json([
            'message' => 'Subscription suspended successfully',
            'subscription' => $subscription->load(['company', 'plan'])
        ]);
    }

    /**
     * Resume a suspended subscription
     */
    public function resume($id)
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'platform_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $subscription = Subscription::findOrFail($id);

        $subscription->update([
            'status' => 'active',
        ]);

        // Mark company as active again
        $subscription->company->update([
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Subscription resumed successfully',
            'subscription' => $subscription->load(['company', 'plan'])
        ]);
    }

    /**
     * Get subscription with payment simulations
     */
    public function getWithSimulations($id)
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'platform_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $subscription = Subscription::with(['company', 'plan'])->findOrFail($id);
        $paymentSimulations = PaymentSimulation::where('subscription_id', $id)->latest()->get();

        return response()->json([
            'subscription' => $subscription,
            'simulations' => $paymentSimulations,
            'plan_details' => [
                'name' => $subscription->plan->name,
                'price' => $subscription->plan->price,
                'trial_days' => $subscription->plan->trial_days,
                'max_vehicles' => $subscription->plan->max_vehicles,
                'max_drivers' => $subscription->plan->max_drivers,
                'max_users' => $subscription->plan->max_users,
                'features' => [
                    'analytics' => $subscription->plan->has_analytics,
                    'map_tracking' => $subscription->plan->has_map_tracking,
                    'maintenance_tracking' => $subscription->plan->has_maintenance_tracking,
                    'expense_tracking' => $subscription->plan->has_expense_tracking,
                ]
            ]
        ]);
    }

    /**
     * Get all subscriptions with payment simulations
     */
    public function getAllWithSimulations()
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'platform_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $subscriptions = Subscription::with(['company', 'plan'])->paginate(10);

        $data = $subscriptions->map(function ($subscription) {
            $simulations = PaymentSimulation::where('subscription_id', $subscription->id)->latest()->get();
            
            return [
                'subscription' => $subscription,
                'simulations' => $simulations,
                'plan_details' => [
                    'name' => $subscription->plan->name,
                    'price' => $subscription->plan->price,
                    'trial_days' => $subscription->plan->trial_days,
                    'max_vehicles' => $subscription->plan->max_vehicles,
                    'max_drivers' => $subscription->plan->max_drivers,
                    'max_users' => $subscription->plan->max_users,
                ]
            ];
        })->toArray();

        return response()->json([
            'data' => $data,
            'pagination' => [
                'current_page' => $subscriptions->currentPage(),
                'per_page' => $subscriptions->perPage(),
                'total' => $subscriptions->total(),
                'last_page' => $subscriptions->lastPage(),
            ]
        ]);
    }

    /**
     * Get subscriptions by status
     */
    public function getByStatus($status)
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'platform_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $subscriptions = Subscription::where('status', $status)
            ->with(['company', 'plan'])
            ->paginate(10);

        return response()->json([
            'data' => $subscriptions->items(),
            'pagination' => [
                'current_page' => $subscriptions->currentPage(),
                'per_page' => $subscriptions->perPage(),
                'total' => $subscriptions->total(),
                'last_page' => $subscriptions->lastPage(),
            ]
        ]);
    }
}
