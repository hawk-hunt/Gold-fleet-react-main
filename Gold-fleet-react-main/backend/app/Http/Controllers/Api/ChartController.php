<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class ChartController extends Controller
{
    /**
     * Get Repair Priority Class data (Area Chart)
     */
    public function repairPriorityClass(): JsonResponse
    {
        $categories = ['Sep \'25', 'Oct \'25', 'Nov \'25', 'Dec \'25', 'Jan \'26', 'Feb \'26'];
        
        $series = [
            [
                'name' => 'No Repair Priority Class',
                'data' => [0, 0, 0, 0, 0, 0],
                'color' => 'rgba(183, 190, 193, 0.75)',
            ],
            [
                'name' => 'Emergency',
                'data' => [0, 0, 0, 2, 4, 5],
                'color' => 'rgba(234, 53, 43, 0.75)',
            ],
            [
                'name' => 'Non-Scheduled',
                'data' => [0, 1, 0, 1, 2, 5],
                'color' => 'rgba(242, 170, 42, 0.75)',
            ],
            [
                'name' => 'Scheduled',
                'data' => [0, 13, 0, 16, 28, 13],
                'color' => 'rgba(40, 164, 102, 0.75)',
            ],
        ];

        return response()->json([
            'categories' => $categories,
            'series' => $series,
        ]);
    }

    /**
     * Get Time to Resolve data (Line Chart with dual Y-axis)
     */
    public function timeToResolve(): JsonResponse
    {
        $categories = ['Sep \'25', 'Oct \'25', 'Nov \'25', 'Dec \'25', 'Jan \'26', 'Feb \'26'];
        
        $series = [
            [
                'name' => 'Avg. Time to Resolve',
                'data' => [0, 0, 0, 1.38, 0, 5.22],
                'yAxis' => 0,
                'color' => '#00A7B9',
            ],
            [
                'name' => '# of Issues',
                'data' => [0, 0, 0, 1, 0, 1],
                'yAxis' => 1,
                'color' => '#FFC107',
                'type' => 'column',
            ],
        ];

        return response()->json([
            'categories' => $categories,
            'series' => $series,
            'yAxis1Title' => 'Days',
            'yAxis2Title' => 'Count',
        ]);
    }

    /**
     * Get Fuel Costs data (Column Chart)
     */
    public function fuelCosts(): JsonResponse
    {
        $categories = ['Sep \'25', 'Oct \'25', 'Nov \'25', 'Dec \'25', 'Jan \'26', 'Feb \'26'];
        
        $series = [
            [
                'name' => 'Fuel Costs',
                'data' => [32641.28, 35462.44, 35695.05, 30138.77, 36827.39, 24910.93],
                'color' => '#34c398',
            ],
        ];

        return response()->json([
            'categories' => $categories,
            'series' => $series,
            'yAxisTitle' => 'Amount ($)',
        ]);
    }

    /**
     * Get Service Costs data (Column Chart)
     */
    public function serviceCosts(): JsonResponse
    {
        $categories = ['Sep \'25', 'Oct \'25', 'Nov \'25', 'Dec \'25', 'Jan \'26', 'Feb \'26'];
        
        $series = [
            [
                'name' => 'Service Costs',
                'data' => [0, 1646.37, 0, 2495.77, 5350.2, 3817.73],
                'color' => '#FFC107',
            ],
        ];

        return response()->json([
            'categories' => $categories,
            'series' => $series,
            'yAxisTitle' => 'Amount ($)',
        ]);
    }
}
