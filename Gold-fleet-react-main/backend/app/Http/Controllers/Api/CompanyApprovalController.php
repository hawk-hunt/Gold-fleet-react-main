<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use App\Models\Notification;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CompanyApprovalController extends Controller
{
    /**
     * Get all pending company approvals (for super admin).
     */
    public function getPendingApprovals(): JsonResponse
    {
        $user = Auth::user();
        
        // Only super admin can view approvals
        if ($user->role !== 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Super admin access required',
            ], 403);
        }

        $companies = Company::where('company_status', 'pending_approval')
            ->with('users')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $companies,
        ]);
    }

    /**
     * Get company details for approval review.
     */
    public function showForApproval($id): JsonResponse
    {
        $user = Auth::user();

        // Only super admin can view for approval
        if ($user->role !== 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Super admin access required',
            ], 403);
        }

        $company = Company::with(['users', 'subscriptions.plan'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $company,
        ]);
    }

    /**
     * Approve a company for full feature access.
     */
    public function approveCompany(Request $request, $id): JsonResponse
    {
        $user = Auth::user();

        // Only super admin can approve companies
        if ($user->role !== 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Super admin access required',
            ], 403);
        }

        try {
            $company = Company::findOrFail($id);

            // Approve the company
            $company->approveCompany($user);

            // Send notifications and messages to company users
            $this->notifyCompanyApproval($company);

            return response()->json([
                'success' => true,
                'message' => 'Company approved successfully',
                'data' => $company->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve company: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reject a company application.
     */
    public function rejectCompany(Request $request, $id): JsonResponse
    {
        $user = Auth::user();

        // Only super admin can reject companies
        if ($user->role !== 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Super admin access required',
            ], 403);
        }

        try {
            $validated = $request->validate([
                'reason' => 'nullable|string|max:1000',
            ]);

            $company = Company::findOrFail($id);

            // Reject the company
            $company->rejectCompany($user);

            // Notify company users of rejection
            $this->notifyCompanyRejection($company, $validated['reason'] ?? null);

            return response()->json([
                'success' => true,
                'message' => 'Company rejected',
                'data' => $company->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject company: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all companies by approval status.
     */
    public function getCompaniesByStatus($status): JsonResponse
    {
        $user = Auth::user();

        // Only super admin can view approval status
        if ($user->role !== 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Super admin access required',
            ], 403);
        }

        $companies = Company::where('company_status', $status)
            ->with('users')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $companies,
        ]);
    }

    /**
     * Send approval notification and message to company users.
     */
    private function notifyCompanyApproval(Company $company): void
    {
        $companyUsers = $company->users()->where('role', 'admin')->get();

        $notificationText = "Your GoldFleet company account has been approved. Fleet management tools are now available.";
        $messageText = "Welcome! Your company '{$company->name}' has been approved by the platform administrator. You now have full access to all GoldFleet features including vehicles, drivers, tracking, and reports.";

        foreach ($companyUsers as $user) {
            // Create notification
            Notification::create([
                'user_id' => $user->id,
                'company_id' => $company->id,
                'title' => 'Company Approved',
                'message' => $notificationText,
                'type' => 'approval',
                'is_read' => false,
            ]);

            // Create message
            Message::create([
                'user_id' => $user->id,
                'company_id' => $company->id,
                'subject' => 'Company Approval Confirmation',
                'message' => $messageText,
                'sender_name' => 'GoldFleet Platform',
                'is_read' => false,
            ]);
        }
    }

    /**
     * Send rejection notification and message to company users.
     */
    private function notifyCompanyRejection(Company $company, ?string $reason = null): void
    {
        $companyUsers = $company->users()->where('role', 'admin')->get();

        $notificationText = "Your company application has been reviewed and cannot be approved at this time.";
        $messageText = "Your company '{$company->name}' application has been reviewed. " . 
                      ($reason ? "Reason: {$reason}. " : "") .
                      "Please contact support for more information.";

        foreach ($companyUsers as $user) {
            // Create notification
            Notification::create([
                'user_id' => $user->id,
                'company_id' => $company->id,
                'title' => 'Company Application Reviewed',
                'message' => $notificationText,
                'type' => 'rejection',
                'is_read' => false,
            ]);

            // Create message
            Message::create([
                'user_id' => $user->id,
                'company_id' => $company->id,
                'subject' => 'Company Application Review Result',
                'message' => $messageText,
                'sender_name' => 'GoldFleet Platform',
                'is_read' => false,
            ]);
        }
    }
}
