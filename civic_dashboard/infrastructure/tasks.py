from celery import shared_task
from .services import MunicipalDataConnector

@shared_task
def update_infrastructure_data():
    connector = MunicipalDataConnector()
    success = connector.update_infrastructure_data()
    if success:
        print("Infrastructure data updated successfully")
    else:
        print("Failed to update infrastructure data")