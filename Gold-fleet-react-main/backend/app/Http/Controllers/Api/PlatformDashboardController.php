<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Company;
use App\Models\Vehicle;
use App\Models\Trip;
use Carbon\Carbon;

class PlatformDashboardController extends Controller
{
    /**
     * Get Dashboard Stats
     * Returns key metrics for platform owner dashboard
     */
    public function getStats()
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'platform_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Get all companies (tenant count)
        $totalCompanies = Company::count();
        $activeCompanies = Company::where('subscription_status', 'active')->count();

        // Get vehicle stats across all companies
        $totalVehicles = Vehicle::count();
        $activeVehicles = Vehicle::where('status', 'active')->count();

        // Get trip stats
        $tripsToday = Trip::whereDate('created_at', Carbon::today())->count();
        $completedTrips = Trip::where('status', 'completed')->whereDate('updated_at', Carbon::today())->count();

        // Get subscription stats
        $activeSubscriptions = Company::where('subscription_status', 'active')->count();
        
        // Calculate monthly revenue (estimate based on subscription plans)
        $basicCount = Company::where('subscription_plan', 'basic')->where('subscription_status', 'active')->count();
        $proCount = Company::where('subscription_plan', 'pro')->where('subscription_status', 'active')->count();
        $enterpriseCount = Company::where('subscription_plan', 'enterprise')->where('subscription_status', 'active')->count();
        
        // Pricing: basic=$99, pro=$299, enterprise=$999
        $monthlyRevenue = ($basicCount * 99) + ($proCount * 299) + ($enterpriseCount * 999);

        // Calculate total revenue
        $totalRevenue = $monthlyRevenue * 6; // Assume 6 months average

        // Calculate subscription renewals (for now, hardcoded as we don't have renewal dates)
        $overdueRenewals = 0;
        $dueSoonRenewals = 0;

        // Build chart data - monthly company growth
        $monthlyData = [];
        $now = Carbon::now();
        
        for ($i = 5; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $monthName = $month->format('M');
            
            $companiesCount = Company::where('created_at', '<=', $month->endOfMonth())
                ->count();
            
            // Calculate revenue for this month
            $basicCount = Company::where('created_at', '<=', $month->endOfMonth())
                ->where('subscription_plan', 'basic')
                ->where('subscription_status', 'active')
                ->count();
            $proCount = Company::where('created_at', '<=', $month->endOfMonth())
                ->where('subscription_plan', 'pro')
                ->where('subscription_status', 'active')
                ->count();
            $enterpriseCount = Company::where('created_at', '<=', $month->endOfMonth())
                ->where('subscription_plan', 'enterprise')
                ->where('subscription_status', 'active')
                ->count();
            
            $monthRevenue = ($basicCount * 99) + ($proCount * 299) + ($enterpriseCount * 999);
            
            $monthlyData[] = [
                'month' => $monthName,
                'companies' => $companiesCount,
                'revenue' => (int)$monthRevenue
            ];
        }

        return response()->json([
            'stats' => [
                'totalCompanies' => $totalCompanies,
                'activeCompanies' => $activeCompanies,
                'totalVehicles' => $totalVehicles,
                'activeVehicles' => $activeVehicles,
                'tripsToday' => $tripsToday,
                'completedTrips' => $completedTrips,
                'activeSubscriptions' => $activeSubscriptions,
                'monthlyRevenue' => '$' . number_format($monthlyRevenue, 0),
                'totalRevenue' => '$' . number_format($totalRevenue, 0),
                'overdueRenewals' => $overdueRenewals,
                'dueSoonRenewals' => $dueSoonRenewals,
            ],
            'charts' => [
                'growth' => $monthlyData
            ]
        ]);
    }

    /**
     * Get Companies
     */
    public function getCompanies()
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'platform_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $companies = Company::paginate(10);

        return response()->json([
            'data' => $companies->items(),
            'pagination' => [
                'current_page' => $companies->currentPage(),
                'per_page' => $companies->perPage(),
                'total' => $companies->total(),
                'last_page' => $companies->lastPage(),
            ]
        ]);
    }

    /**
     * Get Analytics
     */
    public function getAnalytics()
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'platform_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Company growth data
        $companyGrowth = [];
        $now = Carbon::now();
        
        for ($i = 5; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $monthName = $month->format('M');
            
            $count = Company::where('created_at', '<=', $month->endOfMonth())->count();
            
            $companyGrowth[] = [
                'month' => $monthName,
                'companies' => $count
            ];
        }

        // Vehicle usage by company
        $vehicleUsage = Company::withCount('vehicles')
            ->orderBy('vehicles_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($company) {
                return [
                    'name' => $company->name,
                    'vehicles' => $company->vehicles_count
                ];
            });

        // Trip data by company
        $tripsByCompany = Company::with(['vehicles.trips'])
            ->orderBy('name')
            ->limit(10)
            ->get()
            ->map(function ($company) {
                $tripCount = $company->vehicles->sum(function ($vehicle) {
                    return $vehicle->trips->count();
                });
                return [
                    'name' => $company->name,
                    'trips' => $tripCount
                ];
            });

        // Revenue by plan
        $revenueByPlan = [
            ['month' => 'Jan', 'basic' => 2400, 'pro' => 2210, 'enterprise' => 2290],
            ['month' => 'Feb', 'basic' => 3398, 'pro' => 2908, 'enterprise' => 2000],
            ['month' => 'Mar', 'basic' => 2800, 'pro' => 3800, 'enterprise' => 2181],
            ['month' => 'Apr', 'basic' => 3800, 'pro' => 3908, 'enterprise' => 2500],
            ['month' => 'May', 'basic' => 4300, 'pro' => 4800, 'enterprise' => 2210],
            ['month' => 'Jun', 'basic' => 3300, 'pro' => 4300, 'enterprise' => 2100],
        ];

        return response()->json([
            'charts' => [
                'companyGrowth' => $companyGrowth,
                'vehicleUsage' => $vehicleUsage,
                'tripsByCompany' => $tripsByCompany,
                'revenueByPlan' => $revenueByPlan
            ]
        ]);
    }

    /**
     * Get Subscriptions
     */
    public function getSubscriptions()
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'platform_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $companies = Company::paginate(10);
        
        // Map company data to subscription format for frontend
        $subscriptions = $companies->map(function ($company) {
            return [
                'id' => $company->id,
                'company' => $company->name,
                'plan' => $company->subscription_plan,
                'price' => match($company->subscription_plan) {
                    'basic' => 99,
                    'pro' => 299,
                    'enterprise' => 999,
                    default => 0
                },
                'status' => $company->subscription_status,
                'paymentStatus' => $company->subscription_status === 'active' ? 'paid' : 'pending',
                'renewalDate' => $company->updated_at->addMonths(1)->format('Y-m-d'),
            ];
        });

        return response()->json([
            'data' => $subscriptions,
            'pagination' => [
                'current_page' => $companies->currentPage(),
                'per_page' => $companies->perPage(),
                'total' => $companies->total(),
                'last_page' => $companies->lastPage(),
            ]
        ]);
    }

    /**
     * Get Messages
     */
    public function getMessages()
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'platform_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Return mock message data for now
        $messages = [
            [
                'id' => 1,
                'from' => 'ABC Logistics',
                'to' => 'Support Team',
                'subject' => 'Need help with vehicle setup',
                'preview' => 'Hi, we need assistance in setting up our vehicles in the system...',
                'read' => false,
                'date' => '2 hours ago'
            ],
            [
                'id' => 2,
                'from' => 'Fast Delivery Co',
                'to' => 'Support Team',
                'subject' => 'Feature request - bulk import',
                'preview' => 'Can we have a bulk import feature for our 50+ vehicles?',
                'read' => true,
                'date' => '5 hours ago'
            ],
        ];

        return response()->json([
            'data' => $messages,
            'unreadCount' => collect($messages)->where('read', false)->count()
        ]);
    }

    /**
     * Get Settings
     */
    public function getSettings()
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'platform_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'settings' => [
                'platformName' => 'Gold Fleet SaaS',
                'supportEmail' => 'support@goldfleet.com',
                'maxCompanies' => 100,
                'maxVehiclesPerCompany' => 500,
                'enableTrials' => true,
                'defaultTrialDays' => 14,
                'maintenanceMode' => false,
                'notificationEmail' => 'admin@goldfleet.com',
            ]
        ]);
    }

    /**
     * Update Settings
     */
    public function updateSettings()
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'platform_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // For now, just return success
        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => request()->all()
        ]);
    }
}
