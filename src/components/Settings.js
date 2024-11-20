import React, { useState } from 'react';

function Settings({ onDataImport }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setError(null);
  return (
    <div>
      <h2>Settings</h2>
      <button onClick={onDataImport}>Refresh Data</button>
    </div>
  );
  };

  const validateData = (data) => {
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format. Expected an array.');
    }

    data.forEach((item, index) => {
      if (!item.name || !item.type || !item.status || !item.lastMaintenance) {
        throw new Error(`Invalid item at index ${index}. All fields are required.`);
      }

      if (typeof item.name !== 'string' || typeof item.type !== 'string' || typeof item.status !== 'string') {
        throw new Error(`Invalid item at index ${index}. Name, type, and status must be strings.`);
      }

      if (isNaN(Date.parse(item.lastMaintenance))) {
        throw new Error(`Invalid item at index ${index}. Last maintenance date is invalid.`);
      }
    });
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        validateData(data);

        for (const item of data) {
          await window.api.addInfrastructure(item);
        }
        onDataImport();
        setError(null);
      } catch (err) {
        setError(`Error importing data: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <h1>Settings</h1>
      <h2>Import Data</h2>
      <input type="file" onChange={handleFileChange} accept=".json" />
      <button onClick={handleImport}>Import</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Settings;