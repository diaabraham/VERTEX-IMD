from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import InfrastructureAsset
from .serializers import InfrastructureAssetSerializer
from .services import MunicipalDataConnector
from .auth import IsAnalystOrAdmin, IsAdminOnly


class InfrastructureAssetViewSet(viewsets.ModelViewSet):
    queryset = InfrastructureAsset.objects.all()
    serializer_class = InfrastructureAssetSerializer
    permission_classes = [IsAuthenticated, IsAnalystOrAdmin]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated, IsAdminOnly]
        return super().get_permissions()

    @action(detail=False, methods=['POST'])
    def sync_data(self, request):
        connector = MunicipalDataConnector()
        data = connector.fetch_infrastructure_data()
        connector.process_and_save_assets(data)

        return Response({
            'status': 'Data synchronized',
            'assets_processed': len(data)
        })