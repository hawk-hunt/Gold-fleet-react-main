<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Plan;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Plan::truncate();

        // Starter Plan
        Plan::create([
            'name' => 'Starter',
            'description' => 'Perfect for small fleets',
            'price' => 0.00,
            'trial_days' => 12,
            'max_vehicles' => 5,
            'max_drivers' => 5,
            'max_users' => 2,
            'has_analytics' => true,
            'has_map_tracking' => false,
            'has_maintenance_tracking' => true,
            'has_expense_tracking' => true,
            'status' => 'active',
        ]);

        // Professional Plan
        Plan::create([
            'name' => 'Professional',
            'description' => 'For growing businesses',
            'price' => 49.99,
            'trial_days' => 12,
            'max_vehicles' => 50,
            'max_drivers' => 50,
            'max_users' => 10,
            'has_analytics' => true,
            'has_map_tracking' => true,
            'has_maintenance_tracking' => true,
            'has_expense_tracking' => true,
            'status' => 'active',
        ]);

        // Enterprise Plan
        Plan::create([
            'name' => 'Enterprise',
            'description' => 'For large-scale operations',
            'price' => 199.99,
            'trial_days' => 12,
            'max_vehicles' => null,
            'max_drivers' => null,
            'max_users' => null,
            'has_analytics' => true,
            'has_map_tracking' => true,
            'has_maintenance_tracking' => true,
            'has_expense_tracking' => true,
            'status' => 'active',
        ]);
    }
}
