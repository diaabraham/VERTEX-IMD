import * as tf from '@tensorflow/tfjs';

export async function predictMaintenanceNeeds(infrastructureData) {
  // This is a simple example. In a real-world scenario, you'd need more complex models and more data.
  const model = tf.sequential();
  model.add(tf.layers.dense({units: 1, inputShape: [3]}));
  model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});

  const xs = tf.tensor2d(infrastructureData.map(item => [
    item.age,
    item.lastMaintenanceDaysAgo,
    item.usageLevel
  ]));

  const ys = tf.tensor2d(infrastructureData.map(item => [
    item.maintenanceNeeded ? 1 : 0
  ]));

  await model.fit(xs, ys, {epochs: 250});

  return model;
}

export function calculateRiskScore(infrastructure) {
  const ageWeight = 0.4;
  const statusWeight = 0.4;
  const maintenanceWeight = 0.2;

  const ageScore = Math.min(infrastructure.age / 50, 1) * 100;

  const statusScore = {
    'Excellent': 0,
    'Good': 25,
    'Fair': 50,
    'Poor': 75,
    'Critical': 100
  }[infrastructure.status] || 0;

  const daysSinceLastMaintenance = (new Date() - new Date(infrastructure.lastMaintenance)) / (1000 * 60 * 60 * 24);
  const maintenanceScore = Math.min(daysSinceLastMaintenance / 365, 1) * 100;

  return (ageScore * ageWeight) + (statusScore * statusWeight) + (maintenanceScore * maintenanceWeight);
}

export function prioritizeMaintenanceTasks(infrastructureList) {
  return infrastructureList
    .map(item => ({
      ...item,
      riskScore: calculateRiskScore(item)
    }))
    .sort((a, b) => b.riskScore - a.riskScore);
}