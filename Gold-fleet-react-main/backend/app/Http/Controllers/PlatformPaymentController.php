<?php

namespace App\Http\Controllers;

use App\Models\PaymentSimulation;
use App\Models\Company;
use App\Models\Subscription;
use App\Services\PaymentVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class PlatformPaymentController extends Controller
{
    protected PaymentVerificationService $paymentService;

    public function __construct(PaymentVerificationService $paymentService)
    {
        $this->paymentService = $paymentService;
        // Note: Authentication is already handled by 'authorize.api.token' middleware in routes
        // Do not add another auth middleware here to avoid conflicts
    }

    /**
     * Get all payments (Super Admin only)
     */
    public function index(Request $request): JsonResponse
    {
        // Check if user is super admin
        if (!$this->isSuperAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            $query = PaymentSimulation::with(['company', 'subscription.plan'])
                ->orderBy('created_at', 'desc');

            // Filter by status
            if ($request->has('status')) {
                $query->where('payment_status', $request->status);
            }

            // Filter by company
            if ($request->has('company_id')) {
                $query->where('company_id', $request->company_id);
            }

            // Filter by date range
            if ($request->has('from_date') && $request->has('to_date')) {
                $query->whereBetween('payment_date', [
                    $request->from_date,
                    $request->to_date,
                ]);
            }

            $payments = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $payments->items(),
                'pagination' => [
                    'total' => $payments->total(),
                    'per_page' => $payments->perPage(),
                    'current_page' => $payments->currentPage(),
                    'last_page' => $payments->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching payments: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch payments',
            ], 500);
        }
    }

    /**
     * Get single payment details
     */
    public function show(int $paymentId): JsonResponse
    {
        if (!$this->isSuperAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            $payment = PaymentSimulation::with(['company', 'subscription.plan'])
                ->find($paymentId);

            if (!$payment) {
                return response()->json(['error' => 'Payment not found'], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $this->formatPaymentData($payment),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching payment details: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch payment details',
            ], 500);
        }
    }

    /**
     * Get platform revenue statistics
     */
    public function revenueStats(): JsonResponse
    {
        if (!$this->isSuperAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            $stats = $this->paymentService->getPlatformRevenueStats();

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching revenue stats: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch revenue statistics',
            ], 500);
        }
    }

    /**
     * Get company payment statistics
     */
    public function companyStats(int $companyId): JsonResponse
    {
        if (!$this->isSuperAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            $stats = $this->paymentService->getCompanyPaymentStats($companyId);

            // Include company details
            $company = Company::find($companyId);
            if ($company) {
                $stats['company_name'] = $company->name;
                $stats['company_email'] = $company->email;
            }

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching company stats: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch company statistics',
            ], 500);
        }
    }

    /**
     * Get all company payment summaries
     */
    public function companiesSummary(): JsonResponse
    {
        if (!$this->isSuperAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            $companies = Company::with(['paymentSimulations' => function ($query) {
                $query->where('payment_status', 'verified')->orderByDesc('payment_date');
            }])->get();

            $summary = $companies->map(function ($company) {
                $payments = $company->paymentSimulations;
                if ($payments->isEmpty()) {
                    return null;
                }

                $totalPaid = $payments->sum('simulated_amount');
                $companyEarnings = $payments->sum('company_earnings');
                $lastPayment = $payments->first();

                return [
                    'company_id' => $company->id,
                    'company_name' => $company->name,
                    'company_email' => $company->email,
                    'total_paid' => round($totalPaid, 2),
                    'company_earnings' => round($companyEarnings, 2),
                    'payment_count' => $payments->count(),
                    'last_payment_date' => $lastPayment ? ($lastPayment->payment_date ?? $lastPayment->created_at) : null,
                ];
            })->filter(fn($item) => $item !== null);

            return response()->json([
                'success' => true,
                'data' => $summary->values(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error in companiesSummary: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch companies summary: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Manually verify a payment
     */
    public function verifyPayment(int $paymentId, Request $request): JsonResponse
    {
        if (!$this->isSuperAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            $payment = PaymentSimulation::find($paymentId);

            if (!$payment) {
                return response()->json(['error' => 'Payment not found'], 404);
            }

            if ($payment->payment_status === 'verified') {
                return response()->json(['error' => 'Payment already verified'], 400);
            }

            $result = $this->paymentService->verifyPayment($payment);

            if (!$result['success']) {
                return response()->json($result, 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment verified successfully',
                'data' => $this->formatPaymentData($payment->fresh()),
            ]);
        } catch (\Exception $e) {
            Log::error('Error verifying payment: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to verify payment',
            ], 500);
        }
    }

    /**
     * Get company's own payment history
     */
    public function myPayments(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user || !$user->company_id) {
                return response()->json(['error' => 'Company not found'], 403);
            }

            $query = PaymentSimulation::where('company_id', $user->company_id)
                ->with(['subscription.plan'])
                ->orderBy('created_at', 'desc');

            if ($request->has('status')) {
                $query->where('payment_status', $request->status);
            }

            $payments = $query->paginate($request->get('per_page', 10));

            return response()->json([
                'success' => true,
                'data' => $payments->items(),
                'pagination' => [
                    'total' => $payments->total(),
                    'per_page' => $payments->perPage(),
                    'current_page' => $payments->currentPage(),
                    'last_page' => $payments->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching company payments: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch payment history',
            ], 500);
        }
    }

    /**
     * Format payment data for API response
     */
    private function formatPaymentData(PaymentSimulation $payment): array
    {
        return [
            'id' => $payment->id,
            'company_id' => $payment->company_id,
            'company' => [
                'id' => $payment->company->id,
                'name' => $payment->company->name,
                'email' => $payment->company->email,
            ],
            'subscription_id' => $payment->subscription_id,
            'subscription' => [
                'id' => $payment->subscription->id,
                'plan' => [
                    'id' => $payment->subscription->plan->id,
                    'name' => $payment->subscription->plan->name,
                    'price' => $payment->subscription->plan->price,
                ],
                'started_at' => $payment->subscription->started_at,
                'expires_at' => $payment->subscription->expires_at,
                'status' => $payment->subscription->status,
            ],
            'payment' => [
                'amount' => (float) $payment->simulated_amount,
                'method' => $payment->payment_method,
                'date' => $payment->payment_date,
                'status' => $payment->payment_status,
            ],
            'earnings' => [
                'company_pays' => (float) $payment->simulated_amount,
                'platform_earns' => (float) $payment->platform_earnings,
                'company_benefits' => (float) $payment->company_earnings,
                'commission_rate' => ($payment->platform_commission * 100) . '%',
            ],
            'verification' => [
                'status' => $payment->payment_status,
                'verified_at' => $payment->verified_at,
                'notes' => $payment->verification_notes,
            ],
        ];
    }

    /**
     * Check if user is platform admin
     * These endpoints are for platform owners to view all company payments
     */
    private function isSuperAdmin(): bool
    {
        $user = Auth::user();
        return $user && $user->role === 'platform_admin';
    }
}
