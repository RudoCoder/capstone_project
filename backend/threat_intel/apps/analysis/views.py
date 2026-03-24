from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Upload
from apps.analysis.models import AnalysisResult
from .tasks import process_file
from .utils import calculate_hash

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
