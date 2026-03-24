# apps/ioc/serializers.py

from rest_framework import serializers
from .models import IOC, ExtractedIOC


class IOCSerializer(serializers.ModelSerializer):
    class Meta:
        model = IOC
        fields = "__all__"


class ExtractedIOCSerializer(serializers.ModelSerializer):
    ioc = IOCSerializer(read_only=True)

    class Meta:
        model = ExtractedIOC
        fields = "__all__"
