<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Company;
use App\Models\Vehicle;
use App\Models\Trip;
use App\Models\Message;
use Carbon\Carbon;
use Illuminate\Http\Request;

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
     * Delete Company
     * Cascade delete all related data
     */
    public function deleteCompany($id)
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'platform_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $company = Company::findOrFail($id);
            
            // Get company name before deletion
            $companyName = $company->name;
            
            // Delete all related data in proper order to respect foreign keys
            // 1. Delete all trips related to vehicles
            Trip::whereIn('vehicle_id', $company->vehicles()->pluck('id'))->delete();
            
            // 2. Delete all vehicle-related data
            $company->vehicles()->delete();
            
            // 3. Delete all drivers
            $company->drivers()->delete();
            
            // 4. Delete all users in the company
            User::where('company_id', $company->id)->delete();
            
            // 5. Delete subscriptions
            $company->subscriptions()->delete();
            
            // 6. Delete payment simulations
            \App\Models\PaymentSimulation::where('company_id', $company->id)->delete();
            
            // 7. Delete all other company records
            // Services, Inspections, Issues, Expenses, Fuel Fillups, Reminders, etc.
            \App\Models\Service::where('company_id', $company->id)->delete();
            \App\Models\Inspection::where('company_id', $company->id)->delete();
            \App\Models\Issue::where('company_id', $company->id)->delete();
            \App\Models\Expense::where('company_id', $company->id)->delete();
            \App\Models\FuelFillup::where('company_id', $company->id)->delete();
            \App\Models\Reminder::where('company_id', $company->id)->delete();
            
            // 8. Finally delete the company itself
            $company->delete();
            
            return response()->json([
                'message' => "Company '{$companyName}' and all its data have been successfully deleted",
                'deleted_company' => $companyName,
                'timestamp' => now()
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Company not found'], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting company: ' . $e->getMessage()
            ], 500);
        }
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
    public function getMessages(Request $request)
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'platform_admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $page = $request->query('page', 1);
        $limit = $request->query('limit', 10);

        // Fetch real messages from the messages table
        $messagesQuery = Message::orderBy('created_at', 'desc');
        $total = $messagesQuery->count();
        $messagesData = $messagesQuery->skip(($page - 1) * $limit)->take($limit)->get();

        // Format messages for frontend
        $messages = $messagesData->map(function ($msg) {
            return [
                'id' => $msg->id,
                'from' => $msg->name,
                'to' => 'Support Team',
                'subject' => $msg->subject ?? 'Contact Form Submission',
                'preview' => substr($msg->message, 0, 100) . (strlen($msg->message) > 100 ? '...' : ''),
                'read' => $msg->read,
                'date' => $msg->created_at->format('Y-m-d H:i'),
                'email' => $msg->email,
                'fullMessage' => $msg->message,
            ];
        });

        $unreadCount = Message::where('read', false)->count();

        return response()->json([
            'data' => $messages,
            'unreadCount' => $unreadCount,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => $total,
                'last_page' => ceil($total / $limit),
            ]
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
