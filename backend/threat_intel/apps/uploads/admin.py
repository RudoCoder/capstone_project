from django.contrib import admin
from .models import Upload

@admin.register(Upload)
class UploadAdmin(admin.ModelAdmin):
    list_display = ("id", "file_name", "user", "file_hash", "uploaded_at")
    search_fields = ("file_name", "file_hash")
    list_filter = ("uploaded_at",)
