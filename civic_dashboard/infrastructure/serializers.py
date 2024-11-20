from rest_framework import serializers
from .models import InfrastructureAsset

class InfrastructureAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = InfrastructureAsset
        fields = '__all__'