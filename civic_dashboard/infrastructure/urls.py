from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InfrastructureAssetViewSet

router = DefaultRouter()
router.register(r'assets', InfrastructureAssetViewSet)

urlpatterns = [
    path('', include(router.urls)),
]