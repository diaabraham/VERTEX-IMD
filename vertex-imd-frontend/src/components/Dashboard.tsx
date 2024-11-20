import requests
import pandas as pd
from django.conf import settings
from .models import InfrastructureAsset

class MunicipalDataConnector:
    def __init__(self, city='ottawa'):
        self.city = city
        self.config = settings.MUNICIPAL_DATA_SOURCES.get(city)

    def fetch_infrastructure_data(self):
        try:
            response = requests.get(f"{self.config['base_url']}/assets",
                                    headers={"Authorization": f"Bearer {self.config['auth_token']}"})
            response.raise_for_status()
            return pd.DataFrame(response.json())
        except requests.RequestException as e:
            print(f"API Request Error: {e}")
            return pd.DataFrame()

    def process_and_save_assets(self, dataframe):
        assets = []
        for _, row in dataframe.iterrows():
            asset = InfrastructureAsset(
                asset_id=row['id'],
                asset_type=row['type'],
                location=row['location'],
                status=row['status'],
                estimated_condition=row['condition'],
                maintenance_cost=row['maintenance_cost']
            )
            assets.append(asset)
        InfrastructureAsset.objects.bulk_create(assets)

    def update_infrastructure_data(self):
        df = self.fetch_infrastructure_data()
        if not df.empty:
            self.process_and_save_assets(df)
            return True
        return False