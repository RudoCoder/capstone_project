from rest_framework import serializers
from .models import AnalysisResult, RiskScoreDetail


class RiskScoreDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model  = RiskScoreDetail
        fields = "__all__"


class AnalysisResultSerializer(serializers.ModelSerializer):
    risk_details = RiskScoreDetailSerializer(
        source="riskscoredetail_set", many=True, read_only=True
    )
    # Expose the file name directly so the frontend doesn't need to fetch Upload
    file_name = serializers.CharField(source="upload.file_name", read_only=True)

    class Meta:
        model  = AnalysisResult
        fields = "__all__"
