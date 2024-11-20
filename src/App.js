import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import InfrastructureList from './components/InfrastructureList';
import Settings from './components/Settings';

function App() {
  const [infrastructure, setInfrastructure] = useState([]);

  useEffect(() => {
    loadInfrastructure();
  }, []);

  const loadInfrastructure = async () => {
    const data = await window.api.getInfrastructure();
    setInfrastructure(data);
  };

  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/infrastructure">Infrastructure</Link></li>
            <li><Link to="/settings">Settings</Link></li>
          </ul>
        </nav>

        <Switch>
          <Route path="/" exact>
            <Dashboard infrastructure={infrastructure} />
          </Route>
          <Route path="/infrastructure">
            <InfrastructureList infrastructure={infrastructure} />
          </Route>
          <Route path="/settings">
            <Settings onDataImport={loadInfrastructure} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;