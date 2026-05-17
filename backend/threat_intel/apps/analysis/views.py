from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Avg

from .models import AnalysisResult
from .serializers import AnalysisResultSerializer


class AnalysisListView(ListAPIView):
    queryset         = AnalysisResult.objects.all().order_by('-created_at')
    serializer_class = AnalysisResultSerializer
    permission_classes = [IsAuthenticated]


class AnalysisDetailView(RetrieveAPIView):
    queryset         = AnalysisResult.objects.all()
    serializer_class = AnalysisResultSerializer
    lookup_field     = "id"
    permission_classes = [IsAuthenticated]


class RiskTrendView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Return the last 20 scans ordered by date for the risk trend chart."""
        analyses = (
            AnalysisResult.objects
            .order_by("-created_at")[:20]
        )
        data = [
            {
                "id":         a.id,
                "risk_score": a.risk_score,
                "created_at": a.created_at,
            }
            for a in reversed(list(analyses))
        ]
        return Response(data)


class MLInsightsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        analyses = (
            AnalysisResult.objects
            .annotate(
                ioc_count  = Count("extracted_iocs",  distinct=True),
                yara_count = Count("yara_matches",    distinct=True),
                cve_count  = Count("cve_matches",     distinct=True),
            )
            .order_by("-created_at")
        )

        total    = analyses.count()
        avg_risk = analyses.aggregate(a=Avg("risk_score"))["a"] or 0

        threat_distribution = {
            "low":      analyses.filter(risk_score__lt=25).count(),
            "medium":   analyses.filter(risk_score__gte=25, risk_score__lt=50).count(),
            "high":     analyses.filter(risk_score__gte=50, risk_score__lt=75).count(),
            "critical": analyses.filter(risk_score__gte=75).count(),
        }

        per_scan = [
            {
                "id":           a.id,
                "file_name":    a.upload.file_name if hasattr(a.upload, "file_name") else f"Scan #{a.id}",
                "risk_score":   a.risk_score,
                "threat_level": a.threat_level,
                "ioc_count":    a.ioc_count,
                "yara_count":   a.yara_count,
                "cve_count":    a.cve_count,
                "created_at":   a.created_at,
            }
            for a in analyses[:20]
        ]

        avg_ioc  = sum(s["ioc_count"]  for s in per_scan) / max(len(per_scan), 1)
        avg_yara = sum(s["yara_count"] for s in per_scan) / max(len(per_scan), 1)
        avg_cve  = sum(s["cve_count"]  for s in per_scan) / max(len(per_scan), 1)

        return Response({
            "total_scans":         total,
            "avg_risk_score":      round(avg_risk, 1),
            "avg_ioc_count":       round(avg_ioc,  1),
            "avg_yara_count":      round(avg_yara, 1),
            "avg_cve_count":       round(avg_cve,  1),
            "threat_distribution": threat_distribution,
            "per_scan":            per_scan,
        })
