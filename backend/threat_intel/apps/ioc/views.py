from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import IOC, ExtractedIOC
from .utils import extract_iocs
from .serializers import IOCSerializer, ExtractedIOCSerializer

# 1. The view to list all IOCs
class IOCListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        iocs = IOC.objects.all().order_by("-last_seen")
        serializer = IOCSerializer(iocs, many=True)
        return Response(serializer.data)

# 2. The view to see IOCs for a specific analysis
class AnalysisIOCView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, analysis_id):
        extracted_iocs = ExtractedIOC.objects.filter(
            analysis_id=analysis_id
        ).select_related("ioc")
        serializer = ExtractedIOCSerializer(extracted_iocs, many=True)
        return Response(serializer.data)

# 3. The view to run the extraction logic
class IOCOxtractionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        content = request.data.get('content')
        analysis_id = request.data.get('analysis_id')

        if not content or not analysis_id:
            return Response({"error": "Content and analysis_id are required"}, status=400)

        iocs = extract_iocs(content)

        for ip in iocs.get("ips", []):
            ioc_obj, _ = IOC.objects.get_or_create(
                type="ip", value=ip, defaults={"source": "extracted"}
            )
            ExtractedIOC.objects.create(
                analysis_id=analysis_id, ioc=ioc_obj, confidence_score=0.8
            )

        return Response({"message": "Extraction complete", "data": iocs})
