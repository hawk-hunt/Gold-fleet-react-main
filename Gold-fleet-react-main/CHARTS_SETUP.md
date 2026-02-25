# Charts Setup Guide

This guide explains how to set up and use the Highcharts-React chart system.

## Installation

### 1. Install Highcharts React Package

Navigate to your frontend directory:

```bash
cd frontend
npm install highcharts highcharts-react-official
```

### 2. Verify API Routes

The following chart endpoints are available in your Laravel API:

```
GET /api/charts/repair-priority-class
GET /api/charts/time-to-resolve
GET /api/charts/fuel-costs
GET /api/charts/service-costs
```

All endpoints require the `authorize.api.token` middleware (authenticated requests).

## File Structure

```
frontend/src/
├── components/
│   └── Charts/
│       ├── AreaChart.jsx          # Area chart component
│       ├── LineChart.jsx          # Line chart with dual Y-axis
│       ├── ColumnChart.jsx        # Column/Bar chart
│       └── index.js               # Chart exports
├── services/
│   └── chartService.js            # API service for chart data
└── pages/
    └── ChartsDashboard.jsx        # Dashboard page with all charts

backend/app/Http/Controllers/Api/
└── ChartController.php            # Laravel controller for chart data
```

## Usage

### Basic Chart Component Usage

```jsx
import { AreaChart, LineChart, ColumnChart } from '../components/Charts';

// Area Chart (stacked percentages)
<AreaChart
  title="Repair Priority Class"
  dataUrl="/api/charts/repair-priority-class"
  colors={['#b7bed1', '#ea352b', '#f2aa2a', '#28a466']}
/>

// Line Chart (dual Y-axis)
<LineChart
  title="Time to Resolve"
  dataUrl="/api/charts/time-to-resolve"
/>

// Column Chart
<ColumnChart
  title="Fuel Costs"
  dataUrl="/api/charts/fuel-costs"
  color="#34c398"
/>
```

### API Data Format

Each endpoint returns JSON with this structure:

```json
{
  "categories": ["Sep '25", "Oct '25", "..."],
  "series": [
    {
      "name": "Series Name",
      "data": [10, 20, 30, ...],
      "color": "#hexcolor"
    }
  ],
  "yAxisTitle": "Optional Y-Axis Label"
}
```

## Customization

### Chart Colors

Modify the `colors` prop in components:

```jsx
<AreaChart
  colors={['#color1', '#color2', '#color3', '#color4']}
/>
```

### Chart Height

Adjust `height` property in component chart configuration (pixel value).

### Adding New Chart Types

Create a new component following the pattern:

```jsx
// Template
const NewChart = ({ title, dataUrl }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(dataUrl)
      .then(res => res.json())
      .then(data => setChartData(/* format */))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [dataUrl]);

  if (loading || !chartData) return <div>Loading...</div>;
  return <HighchartsReact options={chartData} />;
};
```

## Connecting to Backend

### Laravel Controller Example

```php
public function newChart(): JsonResponse {
    return response()->json([
        'categories' => ['Month1', 'Month2'],
        'series' => [
            [
                'name' => 'Data Series',
                'data' => [100, 200],
            ]
        ]
    ]);
}
```

### API Route Registration

```php
Route::prefix('charts')->group(function () {
    Route::get('/new-chart', [ChartController::class, 'newChart']);
});
```

## Environment Configuration

Ensure your `.env` file has the correct API URL:

```
VITE_API_URL=http://localhost:8000/api
```

## Troubleshooting

### Charts Not Loading
1. Check browser console for CORS errors
2. Verify API token is stored in localStorage
3. Confirm Laravel API is running

### Incorrect Data Display
1. Verify JSON response format matches expected structure
2. Check category array length matches data array length
3. Ensure color format is valid hex or rgba

### Performance Issues
1. Limit data points per chart (recommended: <50)
2. Use pagination for large datasets
3. Implement data caching in chartService
