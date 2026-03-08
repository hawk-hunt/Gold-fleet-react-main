<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
            return response()->json(['message' => 'Unauthorized: Only platform administrators can activate subscriptions'], 403);
        }

        try {
            DB::beginTransaction();

            $subscription = Subscription::findOrFail($id);

            // Check if subscription can be activated
            if ($subscription->status === 'active') {
                return response()->json(['message' => 'Subscription is already active'], 400);
            }

            $subscription->update([
                'status' => 'active',
            ]);

            // Also activate the company
            $subscription->company->update([
                'subscription_status' => 'active',
                'is_active' => true,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Subscription activated successfully',
                'subscription' => $subscription->load(['company', 'plan'])
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['message' => 'Subscription not found'], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to activate subscription: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Deactivate a subscription
     */
    public function deactivate($id)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'platform_admin') {
            return response()->json(['message' => 'Unauthorized: Only platform administrators can deactivate subscriptions'], 403);
        }

        try {
            DB::beginTransaction();

            $subscription = Subscription::findOrFail($id);

            // Check if subscription can be deactivated
            if ($subscription->status === 'cancelled') {
                return response()->json(['message' => 'Subscription is already cancelled'], 400);
            }

            $subscription->update([
                'status' => 'cancelled',
            ]);

            // Also deactivate the company
            $subscription->company->update([
                'subscription_status' => 'cancelled',
                'is_active' => false,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Subscription deactivated successfully',
                'subscription' => $subscription->load(['company', 'plan'])
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['message' => 'Subscription not found'], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to deactivate subscription: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Suspend a subscription (temporary disable)
     */
    public function suspend($id)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'platform_admin') {
            return response()->json(['message' => 'Unauthorized: Only platform administrators can suspend subscriptions'], 403);
        }

        try {
            DB::beginTransaction();

            $subscription = Subscription::findOrFail($id);

            // Check if subscription can be suspended
            if ($subscription->status === 'suspended') {
                return response()->json(['message' => 'Subscription is already suspended'], 400);
            }

            if ($subscription->status !== 'active') {
                return response()->json(['message' => 'Only active subscriptions can be suspended'], 400);
            }

            $subscription->update([
                'status' => 'suspended',
            ]);

            // Also sync company status to match
            $subscription->company->update([
                'subscription_status' => 'suspended',
                'is_active' => false,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Subscription suspended successfully',
                'subscription' => $subscription->load(['company', 'plan'])
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['message' => 'Subscription not found'], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to suspend subscription: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Resume a suspended subscription
     */
    public function resume($id)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'platform_admin') {
            return response()->json(['message' => 'Unauthorized: Only platform administrators can resume subscriptions'], 403);
        }

        try {
            DB::beginTransaction();

            $subscription = Subscription::findOrFail($id);

            // Check if subscription can be resumed
            if ($subscription->status !== 'suspended') {
                return response()->json(['message' => 'Only suspended subscriptions can be resumed'], 400);
            }

            $subscription->update([
                'status' => 'active',
            ]);

            // Sync company status to match
            $subscription->company->update([
                'subscription_status' => 'active',
                'is_active' => true,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Subscription resumed successfully',
                'subscription' => $subscription->load(['company', 'plan'])
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['message' => 'Subscription not found'], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to resume subscription: ' . $e->getMessage()
            ], 500);
        }
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
