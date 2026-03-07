<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Subscription;
use App\Models\Company;

class DeactivateExpiredAccounts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'accounts:deactivate-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Deactivate company accounts whose trial period or subscription has expired';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for expired subscriptions and trials...');

        // Find subscriptions with expired trials (for free accounts)
        $expiredTrials = Subscription::where('trial_ends_at', '<', now())
            ->whereNull('expires_at') // No paid expiration
            ->where('price', 0) // Free plan
            ->where('status', 'active')
            ->with('company')
            ->get();

        // Find subscriptions that have expired (for paid accounts)
        $expiredSubscriptions = Subscription::where('expires_at', '<', now())
            ->where('status', 'active')
            ->with('company')
            ->get();

        // Combine both collections
        $expiredItems = $expiredTrials->merge($expiredSubscriptions);

        if ($expiredItems->count() === 0) {
            $this->info('No expired subscriptions or trials found.');
            return 0;
        }

        $deactivatedCount = 0;

        foreach ($expiredItems as $subscription) {
            try {
                // Mark subscription as expired
                $subscription->update([
                    'status' => 'expired'
                ]);

                // Deactivate the company
                if ($subscription->company) {
                    $subscription->company->update([
                        'is_active' => false
                    ]);
                    $this->line("✓ Deactivated company: {$subscription->company->name}");
                    $deactivatedCount++;
                }
            } catch (\Exception $e) {
                $this->error("Failed to deactivate subscription {$subscription->id}: {$e->getMessage()}");
            }
        }

        $this->info("Deactivation complete. Total accounts deactivated: {$deactivatedCount}");
        return 0;
    }
}
