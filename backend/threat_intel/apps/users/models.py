# apps/users/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("analyst", "Security Analyst"),
        ("user", "Regular User"),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="user")
    organization = models.CharField(max_length=255, blank=True)
    profile_image = models.ImageField(upload_to="profiles/", blank=True, null=True)

    def __str__(self):
        return self.username
