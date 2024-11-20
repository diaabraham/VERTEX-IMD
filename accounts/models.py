from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLES = (
        ('admin', 'Admin'),
        ('analyst', 'Analyst'),
        ('viewer', 'Viewer'),
    )
    role = models.CharField(max_length=10, choices=ROLES, default='viewer')

    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"