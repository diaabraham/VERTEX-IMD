import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from .models import InfrastructureAsset

class PredictiveAnalytics:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)

    def prepare_data(self):
        assets = InfrastructureAsset.objects.all().values()
        df = pd.DataFrame(list(assets))
        df['failure'] = df['estimated_condition'].apply(lambda x: 1 if x < 0.4 else 0)
        features = ['estimated_condition', 'maintenance_cost']
        X = df[features]
        y = df['failure']
        return train_test_split(X, y, test_size=0.2, random_state=42)

    def train_model(self):
        X_train, X_test, y_train, y_test = self.prepare_data()
        self.model.fit(X_train, y_train)
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        print(f"Model accuracy: {accuracy:.2f}")

    def predict_failure(self, asset):
        features = [[asset.estimated_condition, asset.maintenance_cost]]
        prediction = self.model.predict(features)
        return prediction[0]

# Usage
analytics = PredictiveAnalytics()
analytics.train_model()

# Example prediction
asset = InfrastructureAsset.objects.first()
failure_prediction = analytics.predict_failure(asset)
print(f"Failure prediction for asset {asset.asset_id}: {'High risk' if failure_prediction == 1 else 'Low risk'}")