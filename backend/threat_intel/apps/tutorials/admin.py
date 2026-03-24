# apps/tutorials/admin.py

from django.contrib import admin
from .models import Tutorial


@admin.register(Tutorial)
class TutorialAdmin(admin.ModelAdmin):
    list_display = ("title", "tutorial_type", "created_at")
    list_filter = ("tutorial_type",)
    search_fields = ("title",)
