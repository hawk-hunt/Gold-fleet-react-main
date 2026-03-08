<?php

namespace App\Services;

use App\Models\PaymentSimulation;
use App\Models\Plan;
use App\Models\Company;
use App\Models\Notification;
use App\Models\Message;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class PaymentVerificationService
{
    /**
     * Platform commission percentage (20% = 0.20)
     */
    private const PLATFORM_COMMISSION_RATE = 0.20;

    /**
     * Verify and calculate earnings for a payment
     * 
     * When a payment is verified, also approve the company if not already approved.
     * 
     * @param PaymentSimulation $payment
     * @return array
     */
    public function verifyPayment(PaymentSimulation $payment): array
    {
        try {
            // Get the subscription and plan details
            $subscription = $payment->subscription;
            if (!$subscription) {
                throw new \Exception('Subscription not found for this payment');
            }

            $plan = $subscription->plan;
            if (!$plan) {
                throw new \Exception('Plan not found for this subscription');
            }

            // Calculate earnings split
            $paymentAmount = $payment->simulated_amount ?? $plan->price;
            $platformEarnings = round($paymentAmount * self::PLATFORM_COMMISSION_RATE, 2);
            $companyEarnings = round($paymentAmount - $platformEarnings, 2);

            // Update payment with calculated values
            $payment->update([
                'platform_commission' => self::PLATFORM_COMMISSION_RATE,
                'platform_earnings' => $platformEarnings,
                'company_earnings' => $companyEarnings,
                'payment_status' => 'verified',
                'verified_at' => now(),
                'verification_notes' => sprintf(
                    'Payment verified: Company pays %.2f, Platform earns %.2f (20%%), Company benefit: %.2f',
                    $paymentAmount,
                    $platformEarnings,
                    $companyEarnings
                ),
            ]);

            Log::info('Payment verified', [
                'payment_id' => $payment->id,
                'company_id' => $payment->company_id,
                'amount' => $paymentAmount,
                'platform_earnings' => $platformEarnings,
                'company_earnings' => $companyEarnings,
            ]);

            // Step 1: Approve the company for fleet access
            $company = $payment->company;
            if ($company && $company->company_status !== 'approved') {
                $this->approveCompanyAfterPayment($company);
                
                Log::info('Company auto-approved after payment verification', [
                    'company_id' => $company->id,
                    'payment_id' => $payment->id,
                    'company_name' => $company->name,
                ]);
            } else if ($company) {
                Log::info('Company already approved, skipping approval', [
                    'company_id' => $company->id,
                    'payment_id' => $payment->id,
                ]);
            }

            // Step 2: CRITICAL - Activate the subscription
            // Without this, company is approved but subscription is inactive = access denied
            $subscriptionActivated = false;
            if ($subscription && $subscription->status !== 'active') {
                try {
                    $subscription->update(['status' => 'active']);
                    
                    // Sync company.subscription_status to match
                    if ($company) {
                        $company->update([
                            'subscription_status' => 'active',
                            'is_active' => true,
                        ]);
                    }
                    
                    $subscriptionActivated = true;

                    Log::info('Subscription auto-activated after payment verification', [
                        'subscription_id' => $subscription->id,
                        'company_id' => $subscription->company_id,
                        'payment_id' => $payment->id,
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to activate subscription after payment verification', [
                        'subscription_id' => $subscription->id,
                        'payment_id' => $payment->id,
                        'error' => $e->getMessage(),
                    ]);
                    // Don't fail payment verification, just log the error
                }
            }

            return [
                'success' => true,
                'payment_id' => $payment->id,
                'total_amount' => $paymentAmount,
                'platform_earnings' => $platformEarnings,
                'company_earnings' => $companyEarnings,
                'verification_notes' => $payment->verification_notes,
                'company_approved' => $company && $company->company_status === 'approved',
                'subscription_activated' => $subscriptionActivated,
            ];
        } catch (\Exception $e) {
            Log::error('Payment verification failed', [
                'payment_id' => $payment->id,
                'company_id' => $payment->company_id,
                'error' => $e->getMessage(),
            ]);

            $payment->update([
                'payment_status' => 'failed',
                'verification_notes' => 'Payment verification failed: ' . $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get payment statistics for a company
     * 
     * @param int $companyId
     * @return array
     */
    public function getCompanyPaymentStats(int $companyId): array
    {
        $payments = PaymentSimulation::where('company_id', $companyId)
            ->where('payment_status', 'verified')
            ->get();

        $totalPaid = $payments->sum('simulated_amount');
        $totalEarnings = $payments->sum('company_earnings');
        $paymentCount = $payments->count();

        return [
            'company_id' => $companyId,
            'total_paid' => round($totalPaid, 2),
            'company_earnings' => round($totalEarnings, 2),
            'payment_count' => $paymentCount,
            'payments' => $payments->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'amount' => (float) $payment->simulated_amount,
                    'date' => $payment->payment_date,
                    'status' => $payment->payment_status,
                ];
            }),
        ];
    }

    /**
     * Get platform (super admin) revenue statistics
     * 
     * @return array
     */
    public function getPlatformRevenueStats(): array
    {
        $payments = PaymentSimulation::where('payment_status', 'verified')->get();

        $totalCollected = $payments->sum('simulated_amount');
        $platformRevenue = $payments->sum('platform_earnings');
        $companiesEarnings = $payments->sum('company_earnings');
        $paymentCount = $payments->count();

        return [
            'total_collected' => round($totalCollected, 2),
            'platform_revenue' => round($platformRevenue, 2),
            'companies_total_earnings' => round($companiesEarnings, 2),
            'commission_rate' => self::PLATFORM_COMMISSION_RATE * 100,
            'payment_count' => $paymentCount,
            'breakdown' => [
                'platform_percentage' => round((self::PLATFORM_COMMISSION_RATE * 100), 1),
                'company_percentage' => round(((1 - self::PLATFORM_COMMISSION_RATE) * 100), 1),
            ],
        ];
    }

    /**
     * Get the platform commission rate
     * 
     * @return float
     */
    public static function getCommissionRate(): float
    {
        return self::PLATFORM_COMMISSION_RATE;
    }

    /**
     * Approve a company after successful payment verification.
     * 
     * This automatically approves the company for fleet access and sends notifications
     * to all admin users in the company.
     * 
     * @param Company $company
     * @return void
     */
    private function approveCompanyAfterPayment(Company $company): void
    {
        try {
            // Use a system admin (find the first super_admin)
            $systemAdmin = \App\Models\User::where('role', 'super_admin')->first();
            
            if (!$systemAdmin) {
                // If no super admin exists, create a system user reference
                Log::warning('No super admin found for company approval after payment', [
                    'company_id' => $company->id,
                    'company_name' => $company->name,
                ]);
                
                // Approve using direct update instead
                $company->update([
                    'company_status' => 'approved',
                    'approved_at' => now(),
                    'approved_by' => null, // System approval
                ]);
            } else {
                // Approve the company
                $company->approveCompany($systemAdmin);
            }

            // Send notifications to company admin users
            $this->notifyCompanyApprovalAfterPayment($company);

            Log::info('Company successfully approved after payment verification', [
                'company_id' => $company->id,
                'company_name' => $company->name,
                'approved_by' => $systemAdmin ? $systemAdmin->id : 'system',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to approve company after payment verification', [
                'company_id' => $company->id,
                'error' => $e->getMessage(),
            ]);
            
            // Don't throw - log the error but don't fail the payment verification
            // The payment should still be marked as verified even if approval notification fails
        }
    }

    /**
     * Send approval notifications to company admin users after payment verification.
     * 
     * @param Company $company
     * @return void
     */
    private function notifyCompanyApprovalAfterPayment(Company $company): void
    {
        try {
            // Get all admin users in the company
            $companyUsers = $company->users()->where('role', 'admin')->get();

            $notificationText = "Your GoldFleet company account has been approved. Fleet management tools are now available.";
            $messageText = "Congratulations! Your company '{$company->name}' has been approved by the platform. You now have full access to all GoldFleet features including vehicle management, driver tracking, trip logging, maintenance scheduling, expense tracking, and detailed analytics.";

            foreach ($companyUsers as $user) {
                try {
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

                    Log::info('Approval notification sent to user', [
                        'user_id' => $user->id,
                        'company_id' => $company->id,
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to create approval notification for user', [
                        'user_id' => $user->id,
                        'company_id' => $company->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to notify company users after approval', [
                'company_id' => $company->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
