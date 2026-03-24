# apps/cve/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import CVE, CVEMatch
from .serializers import CVESerializer, CVEMatchSerializer


class CVEListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cves = CVE.objects.all().order_by("-severity")
        serializer = CVESerializer(cves, many=True)
        return Response(serializer.data)


class CVEMatchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, analysis_id):
        matches = CVEMatch.objects.filter(
            analysis_id=analysis_id
        ).select_related("cve")

        serializer = CVEMatchSerializer(matches, many=True)
        return Response(serializer.data)
