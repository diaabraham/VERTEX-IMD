import React, { useState } from 'react';

function Settings({ onDataImport }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleImport = async () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = JSON.parse(event.target.result);
      for (const item of data) {
        await window.api.addInfrastructure(item);
      }
      onDataImport();
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <h1>Settings</h1>
      <h2>Import Data</h2>
      <input type="file" onChange={handleFileChange} accept=".json" />
      <button onClick={handleImport}>Import</button>
    </div>
  );
}

export default Settings;