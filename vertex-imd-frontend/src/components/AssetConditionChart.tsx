import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface AssetConditionChartProps {
  data: { assetType: string; averageCondition: number }[];
}

export default function AssetConditionChart({ data }: AssetConditionChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: data.map(item => item.assetType),
            datasets: [{
              label: 'Average Condition',
              data: data.map(item => item.averageCondition),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                max: 1
              }
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return <canvas ref={chartRef} />;
}