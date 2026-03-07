<?php

namespace App\Services;

use App\Models\PaymentSimulation;
use App\Models\Plan;
use Illuminate\Support\Facades\Log;

class PaymentVerificationService
{
    /**
     * Platform commission percentage (20% = 0.20)
     */
    private const PLATFORM_COMMISSION_RATE = 0.20;

    /**
     * Verify and calculate earnings for a payment
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
                'amount' => $paymentAmount,
                'platform_earnings' => $platformEarnings,
                'company_earnings' => $companyEarnings,
            ]);

            return [
                'success' => true,
                'payment_id' => $payment->id,
                'total_amount' => $paymentAmount,
                'platform_earnings' => $platformEarnings,
                'company_earnings' => $companyEarnings,
                'verification_notes' => $payment->verification_notes,
            ];
        } catch (\Exception $e) {
            Log::error('Payment verification failed', [
                'payment_id' => $payment->id,
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
}
