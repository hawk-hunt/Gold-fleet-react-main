import React, { useEffect, useState } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';

const LineChart = ({ title, dataUrl, categories }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(dataUrl);
        const data = await response.json();
        
        const options = {
          chart: {
            type: 'line',
            height: 350,
          },
          title: { text: title },
          xAxis: {
            categories: data.categories || categories,
          },
          yAxis: [
            {
              title: { text: data.yAxis1Title || 'Value' },
              labels: { format: '{value}' },
            },
            {
              title: { text: data.yAxis2Title || 'Count' },
              opposite: true,
              labels: { format: '{value}' },
            },
          ],
          plotOptions: {
            line: {
              dataLabels: { enabled: false },
              enableMouseTracking: true,
            },
          },
          series: data.series || [],
          colors: ['#00A7B9', '#FFC107'],
        };
        setChartData(options);
      } catch (error) {
        console.error('Error fetching line chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataUrl, title, categories]);

  if (loading) return <div className="p-4">Loading chart...</div>;
  if (!chartData) return <div className="p-4">No data available</div>;

  return <HighchartsReact highcharts={Highcharts} options={chartData} />;
};

export default LineChart;
