from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.gis.db import models as gis_models




class InfrastructureAsset(models.Model):
    asset_id = models.CharField(max_length=100, unique=True, db_index=True)
    asset_type = models.CharField(max_length=50, db_index=True)
    location = gis_models.PointField()
    status = models.CharField(max_length=20, db_index=True)
    estimated_condition = models.FloatField()
    maintenance_cost = models.DecimalField(max_digits=10, decimal_places=2)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.asset_type} - {self.asset_id}"

    ASSET_TYPES = [
        ('road', 'Road'),
        ('bridge', 'Bridge'),
        ('water_system', 'Water System'),
        ('sewage', 'Sewage Infrastructure'),
    ]

    STATUS_CHOICES = [
        ('operational', 'Operational'),
        ('maintenance', 'Under Maintenance'),
        ('critical', 'Critical Condition'),
        ('planned_repair', 'Planned Repair'),
    ]

    asset_id = models.CharField(max_length=50, unique=True)
    asset_type = models.CharField(max_length=50, choices=ASSET_TYPES)
    location = models.JSONField()

    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='operational'
    )

    last_maintenance_date = models.DateTimeField(default=timezone.now)
    estimated_condition = models.FloatField(
        help_text='Condition score (0-100)',
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    maintenance_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    class Meta:
        indexes = [
            models.Index(fields=['asset_type', 'status']),
            models.Index(fields=['estimated_condition', 'maintenance_cost']),
        ]

    def __str__(self):
        return f"{self.asset_type} - {self.asset_id}"

    @classmethod
    def get_all_assets(cls):
        cache_key = 'all_assets'
        assets = cache.get(cache_key)
        if not assets:
            assets = list(cls.objects.all())
            cache.set(cache_key, assets, timeout=3600)  # Cache for 1 hour
        return assets