import React from 'react';
import { Bar } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function Dashboard({ infrastructure }) {
  const statusCounts = infrastructure.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

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

  return (
    <div>
      <h1>Dashboard</h1>
      <div style={{ height: '300px', width: '500px' }}>
        <Bar data={chartData} options={{ maintainAspectRatio: false }} />
      </div>
      <div style={{ height: '400px', width: '100%' }}>
        <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {infrastructure.map((item) => (
            <Marker key={item.id} position={[item.lat, item.lng]}>
              <Popup>{item.name} - {item.status}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default Dashboard;