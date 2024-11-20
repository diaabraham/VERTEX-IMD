from django.test import TestCase
from django.test import TestCase
from django.contrib.auth.models import User, Group
from rest_framework.test import APIClient
from rest_framework import status
from .models import InfrastructureAsset
from .services import MunicipalDataConnector
from django.contrib.gis.geos import Point


class InfrastructureAssetAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser('admin', 'admin@example.com', 'adminpass')
        self.analyst_user = User.objects.create_user('analyst', 'analyst@example.com', 'analystpass')
        self.asset = InfrastructureAsset.objects.create(
            asset_id='TEST001',
            asset_type='Bridge',
            location=Point(0, 0),
            status='Good',
            estimated_condition=0.8,
            maintenance_cost=10000.00)
        analyst_group = Group.objects.create(name='Analyst')
        self.analyst_user.groups.add(analyst_group)

        self.asset = InfrastructureAsset.objects.create(
            asset_id='TEST001',
            asset_type='Bridge',
            location=Point(0, 0),
            status='Good',
            estimated_condition=85.5,
            maintenance_cost=10000.00
        )

    def test_asset_creation(self):
        self.assertTrue(isinstance(self.asset, InfrastructureAsset))
        self.assertEqual(self.asset.__str__(), 'Bridge - TEST001')

    def test_list_assets_authenticated(self):
        self.client.force_authenticate(user=self.analyst_user)
        response = self.client.get('/api/assets/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_assets_unauthenticated(self):
        response = self.client.get('/api/assets/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_asset_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'asset_id': 'TEST002',
            'asset_type': 'Road',
            'location': {'type': 'Point', 'coordinates': [1, 1]},
            'status': 'Fair',
            'estimated_condition': 70.0,
            'maintenance_cost': 5000.00
        }
        response = self.client.post('/api/assets/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_asset_analyst(self):
        self.client.force_authenticate(user=self.analyst_user)
        data = {
            'asset_id': 'TEST003',
            'asset_type': 'Park',
            'location': {'type': 'Point', 'coordinates': [2, 2]},
            'status': 'Excellent',
            'estimated_condition': 95.0,
            'maintenance_cost': 2000.00
        }
        response = self.client.post('/api/assets/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

class MunicipalDataConnectorTest(TestCase):
    def setUp(self):
        self.connector = MunicipalDataConnector()

    def test_fetch_infrastructure_data(self):
        df = self.connector.fetch_infrastructure_data()
        self.assertFalse(df.empty)
        self.assertTrue('id' in df.columns)
        self.assertTrue('type' in df.columns)

    def test_process_and_save_assets(self):
        test_data = {
            'id': ['TEST002'],
            'type': ['Road'],
            'location': ['POINT(1 1)'],
            'status': ['Fair'],
            'condition': [0.6],
            'maintenance_cost': [5000.00]
        }
        df = pd.DataFrame(test_data)
        self.connector.process_and_save_assets(df)
        saved_asset = InfrastructureAsset.objects.get(asset_id='TEST002')
        self.assertEqual(saved_asset.asset_type, 'Road')
        self.assertEqual(saved_asset.status, 'Fair')