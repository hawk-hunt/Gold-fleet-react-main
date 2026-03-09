<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureDriverVerified
{
    /**
     * Handle an incoming request - Ensure driver can access driver pages.
     * 
     * Access is based on company verification status (not individual user verification).
     * 
     * Requirements:
     * - User must be authenticated AND
     * - User must be either a driver or company admin AND
     * - User's company must be verified (account_status = 'verified') AND
     * - If user is a driver: driver profile must exist
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

        // Super admin (clark@gmail.com) bypass
        if ($user->email === 'clark@gmail.com') {
            return $next($request);
        }

        // User must have a company
        if (!$user->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'No company assigned to your account',
                'code' => 'NO_COMPANY',
            ], 403);
        }

        // Load company relationship
        $company = $user->company;
        if (!$company) {
            return response()->json([
                'success' => false,
                'message' => 'Company not found',
                'code' => 'COMPANY_NOT_FOUND',
            ], 403);
        }

        // Company must be verified (account_status = 'verified')
        // This applies to all users - drivers and admins alike
        if ($company->account_status !== 'verified') {
            return response()->json([
                'success' => false,
                'message' => 'Your company account is not yet verified. Please wait for verification.',
                'code' => 'COMPANY_NOT_VERIFIED',
                'company_status' => $company->account_status,
            ], 403);
        }

        // User must be either a driver or company admin
        if ($user->role !== 'driver' && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Only drivers and company admins can access this resource',
                'code' => 'UNAUTHORIZED_ROLE',
            ], 403);
        }

        // If user is a driver, driver record must exist
        if ($user->role === 'driver' && !$user->driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found',
                'code' => 'DRIVER_NOT_FOUND',
            ], 403);
        }

        return $next($request);
    }
}
