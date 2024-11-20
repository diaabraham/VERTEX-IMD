import React from 'react';

function InfrastructureList({ infrastructure }) {
  return (
    <div>
      <h2>Infrastructure List</h2>
      <ul>
        {infrastructure.map((item, index) => (
          <li key={index}>{item.name} - {item.status}</li>
        ))}
      </ul>
    </div>
  );
}

export default InfrastructureList;