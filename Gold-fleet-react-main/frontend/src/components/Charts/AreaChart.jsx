import React, { useEffect, useState } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';

const AreaChart = ({ title, dataUrl, categories, colors }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(dataUrl);
        const data = await response.json();
        
        const options = {
          chart: {
            type: 'area',
            height: 400,
          },
          title: { text: title },
          xAxis: {
            categories: data.categories || categories,
          },
          yAxis: {
            title: { text: 'Value' },
          },
          plotOptions: {
            area: {
              stacking: 'percent',
              lineColor: '#666666',
              lineWidth: 1,
              marker: { lineWidth: 1, lineColor: '#666666' },
            },
          },
          series: data.series || [],
          colors: colors || ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'],
        };
        setChartData(options);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataUrl, title, categories, colors]);

  if (loading) return <div className="p-4">Loading chart...</div>;
  if (!chartData) return <div className="p-4">No data available</div>;

  return <HighchartsReact highcharts={Highcharts} options={chartData} />;
};

export default AreaChart;
