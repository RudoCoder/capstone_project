from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
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

# 4. Existing Upload View (Check if this is in apps/uploads/views.py or here)
# If it's here, keep it; if it's in uploads, you can remove it from this file.
class UploadView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        # ... (your existing upload logic)
        return Response({"status": "processing"})
