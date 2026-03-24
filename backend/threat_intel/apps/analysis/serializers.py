# apps/analysis/serializers.py

from rest_framework import serializers
from .models import AnalysisResult, RiskScoreDetail


class RiskScoreDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskScoreDetail
        fields = "__all__"


class AnalysisResultSerializer(serializers.ModelSerializer):
    risk_details = RiskScoreDetailSerializer(
        source="riskscoredetail_set", many=True, read_only=True
    )

    class Meta:
        model = AnalysisResult
        fields = "__all__"
