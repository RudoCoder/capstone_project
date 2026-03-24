# apps/cve/serializers.py

from rest_framework import serializers
from .models import CVE, CVEMatch


class CVESerializer(serializers.ModelSerializer):
    class Meta:
        model = CVE
        fields = "__all__"


class CVEMatchSerializer(serializers.ModelSerializer):
    cve = CVESerializer(read_only=True)

    class Meta:
        model = CVEMatch
        fields = "__all__"
