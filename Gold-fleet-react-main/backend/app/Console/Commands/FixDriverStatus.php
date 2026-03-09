<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FixDriverStatus extends Command
{
    protected $signature = 'drivers:fix-status {--verified : Mark drivers as verified}';
    protected $description = 'Fix driver account statuses';

    public function handle()
    {
        // Update all drivers with NULL or pending account_status to verified
        $updated = DB::table('users')
            ->where('role', 'driver')
            ->whereIn('account_status', [null, 'pending'])
            ->update(['account_status' => 'verified']);

        $this->info("Updated {$updated} driver accounts to verified status.");
    }
}
