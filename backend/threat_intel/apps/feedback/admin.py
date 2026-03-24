# apps/feedback/admin.py

from django.contrib import admin
from .models import Feedback


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("user", "analysis", "feedback_type", "created_at")
    list_filter = ("feedback_type",)
    search_fields = ("user__username",)
