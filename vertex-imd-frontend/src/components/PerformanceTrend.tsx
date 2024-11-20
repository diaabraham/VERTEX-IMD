import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

interface TrendData {
  date: string;
  average_condition: number;
}

export default function PerformanceTrend() {
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        const response = await axios.get('/api/performance-trend/');
        setTrendData(response.data);
      } catch (error) {
        console.error('Error fetching trend data:', error);
      }
    };

    fetchTrendData();
  }, []);

  const data = {
    labels: trendData.map(item => item.date),
    datasets: [
      {
        label: 'Average Asset Condition',
        data: trendData.map(item => item.average_condition),
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Asset Performance Trend</h2>
      <Line data={data} options={options} />
    </div>
  );
}