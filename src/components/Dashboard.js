import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import * as tf from '@tensorflow/tfjs';

// These functions should be implemented in a separate file
import { predictMaintenanceNeeds, prioritizeMaintenanceTasks, calculateRiskScore } from '../utils/dataProcessing';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function Dashboard({ infrastructure }) {
  const [maintenancePredictions, setMaintenancePredictions] = useState([]);
  const [prioritizedTasks, setPrioritizedTasks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function processData() {
      if (!infrastructure || infrastructure.length === 0) {
        setError('No infrastructure data available');
        return;
      }

      try {
        const model = await predictMaintenanceNeeds(infrastructure);
        const predictions = infrastructure.map(item => ({
          ...item,
          maintenanceNeeded: model.predict(tf.tensor2d([[item.age, item.lastMaintenanceDaysAgo, item.usageLevel]])).dataSync()[0] > 0.5
        }));
        setMaintenancePredictions(predictions);

        const prioritized = prioritizeMaintenanceTasks(infrastructure);
        setPrioritizedTasks(prioritized);
      } catch (err) {
        console.error('Error processing data:', err);
        setError('Error processing infrastructure data');
      }
    }

    processData();
  }, [infrastructure]);

  const statusCounts = infrastructure ? infrastructure.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {}) : {};

  const chartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: 'Infrastructure Status',
        data: Object.values(statusCounts),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <div style={{ height: '300px', width: '500px' }}>
        <Bar data={chartData} options={{ maintainAspectRatio: false, responsive: true }} />
      </div>
      <div style={{ height: '400px', width: '100%' }}>
        <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {infrastructure && infrastructure.map((item) => (
            <Marker key={item.id} position={[item.lat, item.lng]}>
              <Popup>{item.name} - {item.status}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <h2>Maintenance Predictions</h2>
      <ul>
        {maintenancePredictions.map(item => (
          <li key={item.id}>{item.name}: {item.maintenanceNeeded ? 'Needs maintenance' : 'No maintenance needed'}</li>
        ))}
      </ul>
      <h2>Prioritized Maintenance Tasks</h2>
      <ol>
        {prioritizedTasks.map(item => (
          <li key={item.id}>{item.name} (Risk Score: {item.riskScore.toFixed(2)})</li>
        ))}
      </ol>
    </div>
  );
}

export default Dashboard;