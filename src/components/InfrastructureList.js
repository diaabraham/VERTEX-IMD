import React from 'react';

function InfrastructureList({ infrastructure }) {
  return (
    <div>
      <h1>Infrastructure List</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Status</th>
            <th>Last Maintenance</th>
          </tr>
        </thead>
        <tbody>
          {infrastructure.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.type}</td>
              <td>{item.status}</td>
              <td>{new Date(item.lastMaintenance).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InfrastructureList;