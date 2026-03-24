from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Upload
from apps.analysis.models import AnalysisResult
from apps.uploads.tasks import process_file
from .utils import calculate_risk
from rest_framework.generics import RetrieveAPIView
from .models import AnalysisResult
from .serializers import AnalysisResultSerializer


class AnalysisDetailView(RetrieveAPIView):
    """
    Retrieve detailed analysis for a specific upload
    """
    queryset = AnalysisResult.objects.all()
    serializer_class = AnalysisResultSerializer
    lookup_field = "id"


class UploadView(APIView):
    def post(self, request):
        file = request.FILES["file"]

        upload = Upload.objects.create(
            user=request.user,
            file=file,
            file_name=file.name
        )

        upload.file_hash = calculate_hash(upload.file.path)
        upload.save()

        analysis = AnalysisResult.objects.create(upload=upload)

        process_file.delay(upload.id, analysis.id)

        return Response({"analysis_id": analysis.id})
