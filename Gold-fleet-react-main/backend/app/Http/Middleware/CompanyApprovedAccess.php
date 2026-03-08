<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CompanyApprovedAccess
{
    /**
     * Handle an incoming request - only allow if company is approved.
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

        // User must have company
        if (!$user->company_id) {
            return response()->json([
                'success' => false,
                'message' => 'No company assigned',
            ], 403);
        }

        $company = $user->company;

        // Company must be approved
        if (!$company || $company->company_status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Company not approved for this feature',
                'company_status' => $company ? $company->company_status : null,
                'approval_status' => 'pending',
            ], 403);
        }

        return $next($request);
    }
}
