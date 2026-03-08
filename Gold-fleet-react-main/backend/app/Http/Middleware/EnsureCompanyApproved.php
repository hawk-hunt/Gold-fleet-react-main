<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCompanyApproved
{
    /**
     * Handle an incoming request - Ensure company is fully approved for restricted features.
     * 
     * Check all three conditions:
     * - account_status = verified
     * - subscription_status = active
     * - company_status = approved
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        // User must be authenticated
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Authentication required',
                'code' => 'UNAUTHENTICATED',
            ], 401);
        }

        // User's account must be verified
        if ($user->account_status !== 'verified') {
            return response()->json([
                'success' => false,
                'message' => 'Your account is not yet verified',
                'code' => 'ACCOUNT_NOT_VERIFIED',
                'user_account_status' => $user->account_status,
            ], 403);
        }

        // User must have a company
        if (!$user->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'No company assigned to your account',
                'code' => 'NO_COMPANY',
            ], 403);
        }

        $company = $user->company;

        // Company must exist
        if (!$company) {
            return response()->json([
                'success' => false,
                'message' => 'Company not found',
                'code' => 'COMPANY_NOT_FOUND',
            ], 403);
        }

        // Company's subscription must be active
        if ($company->subscription_status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Your subscription is not active',
                'code' => 'SUBSCRIPTION_NOT_ACTIVE',
                'subscription_status' => $company->subscription_status,
            ], 403);
        }

        // Company must be approved
        if ($company->company_status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Your company account is not yet approved for this feature',
                'code' => 'COMPANY_NOT_APPROVED',
                'company_status' => $company->company_status,
                'approval_status' => 'pending',
            ], 403);
        }

        // Store approval status in request for logging/auditing
        $request->attributes->set('company_approved', true);
        $request->attributes->set('company_status', $company->company_status);

        return $next($request);
    }
}
