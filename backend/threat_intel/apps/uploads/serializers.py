from rest_framework import serializers
from .models import Upload

class UploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Upload
        fields = [
            "id",
            "user",
            "file",
            "file_name",
            "file_hash",
            "uploaded_at"
        ]
        read_only_fields = ["id", "file_hash", "uploaded_at", "user"]
