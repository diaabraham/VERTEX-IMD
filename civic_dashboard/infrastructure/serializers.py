from rest_framework import serializers
from .models import InfrastructureAsset

class InfrastructureAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = InfrastructureAsset
        fields = ['id', 'asset_id', 'asset_type', 'location', 'status', 'estimated_condition', 'maintenance_cost', 'last_updated']