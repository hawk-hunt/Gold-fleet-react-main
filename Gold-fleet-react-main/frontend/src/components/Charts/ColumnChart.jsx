import React, { useEffect, useState } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';

const ColumnChart = ({ title, dataUrl, categories, color }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(dataUrl);
        const data = await response.json();
        
        const options = {
          chart: {
            type: 'column',
            height: 350,
          },
          title: { text: title },
          xAxis: {
            categories: data.categories || categories,
            crosshair: true,
          },
          yAxis: {
            title: { text: data.yAxisTitle || 'Value' },
          },
          tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>${point.y:.2f}</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true,
          },
          plotOptions: {
            column: {
              pointPadding: 0.2,
              borderWidth: 0,
            },
          },
          series: data.series || [],
          colors: [color || '#34c398'],
        };
        setChartData(options);
      } catch (error) {
        console.error('Error fetching column chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataUrl, title, categories, color]);

  if (loading) return <div className="p-4">Loading chart...</div>;
  if (!chartData) return <div className="p-4">No data available</div>;

  return <HighchartsReact highcharts={Highcharts} options={chartData} />;
};

export default ColumnChart;
