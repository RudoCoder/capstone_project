# apps/users/admin.py

from django.contrib import admin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "role", "organization")
    search_fields = ("username", "email")
    list_filter = ("role",)
