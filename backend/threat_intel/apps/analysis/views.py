from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Avg
from .models import AnalysisResult
from .serializers import AnalysisResultSerializer

# 1. NEW: List View for the Dashboard table
class AnalysisListView(ListAPIView):
    queryset = AnalysisResult.objects.all().order_by('-created_at')
    serializer_class = AnalysisResultSerializer
    permission_classes = [IsAuthenticated]

# 2. Existing Detail View
class AnalysisDetailView(RetrieveAPIView):
    queryset = AnalysisResult.objects.all()
    serializer_class = AnalysisResultSerializer
    lookup_field = "id"
    permission_classes = [IsAuthenticated]

# 3. NEW: Data for your React Charts
class RiskTrendView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # This provides the data your RiskChart.jsx is looking for
        # You can later replace this with a real query (e.g. grouped by date)
        data = [
            {"month": "Jan", "risk_level": 10},
            {"month": "Feb", "risk_level": 25},
            {"month": "Mar", "risk_level": 40},
            {"month": "Apr", "risk_level": 30},
        ]
        return Response(data)

# 4. ML Insights — aggregate feature data per analysis
class MLInsightsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        analyses = (
            AnalysisResult.objects
            .annotate(
                ioc_count=Count("extractedioc", distinct=True),
                yara_count=Count("yaramatch", distinct=True),
                cve_count=Count("cvematch", distinct=True),
            )
            .order_by("-created_at")
        )

        total = analyses.count()
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
            "total_scans":          total,
            "avg_risk_score":       round(avg_risk, 1),
            "avg_ioc_count":        round(avg_ioc, 1),
            "avg_yara_count":       round(avg_yara, 1),
            "avg_cve_count":        round(avg_cve, 1),
            "threat_distribution":  threat_distribution,
            "per_scan":             per_scan,
        })


# 5. Existing Upload View (Check if this is in apps/uploads/views.py or here)
# If it's here, keep it; if it's in uploads, you can remove it from this file.
class UploadView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        # ... (your existing upload logic)
        return Response({"status": "processing"})
