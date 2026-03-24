# apps/ioc/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import IOC, ExtractedIOC
from .serializers import IOCSerializer, ExtractedIOCSerializer


class IOCListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        iocs = IOC.objects.all().order_by("-last_seen")
        serializer = IOCSerializer(iocs, many=True)
        return Response(serializer.data)


class AnalysisIOCView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, analysis_id):
        extracted_iocs = ExtractedIOC.objects.filter(
            analysis_id=analysis_id
        ).select_related("ioc")

        serializer = ExtractedIOCSerializer(extracted_iocs, many=True)
        return Response(serializer.data)
