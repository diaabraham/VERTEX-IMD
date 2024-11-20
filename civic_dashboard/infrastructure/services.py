import requests
import pandas as pd
from django.conf import settings
from .models import InfrastructureAsset
import logging

logger = logging.getLogger(__name__)

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
            logger.error(f"API Request Error: {e}")
            return pd.DataFrame()

    def validate_data(self, df):
        required_columns = ['id', 'type', 'location', 'status', 'condition', 'maintenance_cost']
        if not all(col in df.columns for col in required_columns):
            logger.error("Missing required columns in the data")
            return False
# Check for null values
        if df[required_columns].isnull().any().any():
            logger.error("Null values found in required columns")
            return False
#   Validate data types
        try:
            df['condition'] = df['condition'].astype(float)
            df['maintenance_cost'] = df['maintenance_cost'].astype(float)
        except ValueError:
            logger.error("Invalid data types for condition or maintenance_cost")
            return False

        return True

    def process_and_save_assets(self, dataframe):
        if not self.validate_data(dataframe):
            return False

        assets = []
        for _, row in dataframe.iterrows():
            try:
                asset = InfrastructureAsset(
                    asset_id=row['id'],
                    asset_type=row['type'],
                    location=row['location'],
                    status=row['status'],
                    estimated_condition=row['condition'],
                    maintenance_cost=row['maintenance_cost']
                )
                assets.append(asset)
            except Exception as e:
                logger.error(f"Error processing asset: {e}")

        if assets:
            InfrastructureAsset.objects.bulk_create(assets)
            logger.info(f"Successfully processed and saved {len(assets)} assets")
            return True
        else:
            logger.warning("No assets were processed and saved")
            return False

    def update_infrastructure_data(self):
        df = self.fetch_infrastructure_data()
        if not df.empty:
            return self.process_and_save_assets(df)
        return False