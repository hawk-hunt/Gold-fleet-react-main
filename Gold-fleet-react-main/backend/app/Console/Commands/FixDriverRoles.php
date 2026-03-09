<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Driver;

class FixDriverRoles extends Command
{
    protected $signature = 'drivers:fix-roles';
    protected $description = 'Ensure all drivers have correct role and account status';

    public function handle()
    {
        try {
            // Get all drivers and update their users to have role='driver' and account_status='verified'
            $drivers = Driver::all();
            
            $count = 0;
            foreach ($drivers as $driver) {
                if ($driver->user) {
                    $driver->user->update([
                        'role' => 'driver',
                        'account_status' => 'verified',
                    ]);
                    $count++;
                }
            }

            $this->info("Updated {$count} driver users to have role='driver' and account_status='verified'");
        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
        }
    }
}
