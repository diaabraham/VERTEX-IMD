import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

interface Asset {
  id: number;
  asset_id: string;
  asset_type: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  status: string;
  estimated_condition: number;
  maintenance_cost: number;
}

export default function AssetMap() {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await axios.get('/api/assets/');
        setAssets(response.data);
      } catch (error) {
        console.error('Error fetching assets:', error);
      }
    };

    fetchAssets();
  }, []);

  return (
    <MapContainer center={[45.4215, -75.6972]} zoom={13} style={{ height: '600px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {assets.map((asset) => (
        <Marker key={asset.id} position={[asset.location.coordinates[1], asset.location.coordinates[0]]}>
          <Popup>
            <div>
              <h3>{asset.asset_type}</h3>
              <p>ID: {asset.asset_id}</p>
              <p>Status: {asset.status}</p>
              <p>Condition: {asset.estimated_condition.toFixed(2)}</p>
              <p>Maintenance Cost: ${asset.maintenance_cost.toFixed(2)}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}