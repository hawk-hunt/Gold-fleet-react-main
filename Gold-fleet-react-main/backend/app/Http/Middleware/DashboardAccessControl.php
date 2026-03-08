<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DashboardAccessControl
{
    /**
     * Handle an incoming request.
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
            ], 401);
        }

        // User must have verified account
        if ($user->account_status !== 'verified') {
            return response()->json([
                'success' => false,
                'message' => 'Account not verified',
                'user_status' => $user->account_status,
            ], 403);
        }

        // User must belong to a company
        if (!$user->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'No company assigned',
            ], 403);
        }

        $company = $user->company;

        // Company must have subscription
        if (!$company || $company->subscription_status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Subscription not active',
                'subscription_status' => $company ? $company->subscription_status : null,
            ], 403);
        }

        // Store company status in request for controller use
        $request->attributes->set('company_status', $company->company_status);

        return $next($request);
    }
}
