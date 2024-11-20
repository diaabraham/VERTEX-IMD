import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import InfrastructureList from './components/InfrastructureList';
import Settings from './components/Settings';

function App() {
  console.log('App component rendering');
  const [infrastructure, setInfrastructure] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    console.log('App useEffect running');
    loadInfrastructure();
  }, []);

  const loadInfrastructure = async () => {
    console.log('Loading infrastructure');
    try {
      const data = await window.api.getInfrastructure();
      console.log('Infrastructure data:', data);
      setInfrastructure(data);
    } catch (error) {
      console.error('Error loading infrastructure:', error);
    }
  };

  const renderView = () => {
    console.log('Rendering view:', currentView);
    switch (currentView) {
      case 'dashboard':
        return <Dashboard infrastructure={infrastructure} />;
      case 'list':
        return <InfrastructureList infrastructure={infrastructure} />;
      case 'settings':
        return <Settings onDataImport={loadInfrastructure} />;
      default:
        return <Dashboard infrastructure={infrastructure} />;
    }
  };

  return (
    <div>
      <h1>Vertex IMD</h1>
      <nav>
        <button onClick={() => setCurrentView('dashboard')}>Dashboard</button>
        <button onClick={() => setCurrentView('list')}>Infrastructure List</button>
        <button onClick={() => setCurrentView('settings')}>Settings</button>
      </nav>
      {renderView()}
    </div>
  );
}

export default App;