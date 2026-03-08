<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlatformStatusController extends Controller
{
    /**
     * Get the current platform status for the authenticated user.
     * 
     * Returns account status, subscription status, and company approval status.
     * This endpoint is used by frontend to determine which features are available.
     */
    public function getStatus(Request $request): JsonResponse
    {
        $user = auth()->user();

        // Not authenticated
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Not authenticated',
                'authenticated' => false,
            ], 401);
        }

        // User not linked to company
        if (!$user->company_id) {
            return response()->json([
                'success' => true,
                'authenticated' => true,
                'user' => [
                    'id' => $user->id,
                    'account_status' => $user->account_status,
                ],
                'company' => null,
            ]);
        }

        $company = $user->company;

        // Return full platform status
        return response()->json([
            'success' => true,
            'authenticated' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'account_status' => $user->account_status,
            ],
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
                'account_status' => $company->account_status,
                'company_status' => $company->company_status,
                'subscription_status' => $company->subscription_status,
                'approved_at' => $company->approved_at,
                'approved_by' => $company->approved_by,
            ],
            'access' => [
                'is_verified' => $user->account_status === 'verified',
                'is_approved' => $company->company_status === 'approved',
                'has_active_subscription' => $company->subscription_status === 'active',
                'can_access_fleet_features' => $this->canAccessFleetFeatures($user, $company),
            ],
            'restrictions' => [
                'blocked_reason' => $this->getBlockedReason($user, $company),
            ],
        ]);
    }

    /**
     * Check if user can access fleet management features.
     */
    private function canAccessFleetFeatures($user, $company): bool
    {
        return $user->account_status === 'verified' &&
               $company->subscription_status === 'active' &&
               $company->company_status === 'approved';
    }

    /**
     * Determine the reason for blocking, if any.
     */
    private function getBlockedReason($user, $company): ?string
    {
        if ($user->account_status !== 'verified') {
            return 'account_not_verified';
        }

        if ($company->subscription_status !== 'active') {
            return 'subscription_not_active';
        }

        if ($company->company_status === 'pending') {
            return 'company_pending_registration';
        }

        if ($company->company_status === 'pending_approval') {
            return 'company_pending_approval';
        }

        if ($company->company_status === 'rejected') {
            return 'company_rejected';
        }

        return null;
    }
}
