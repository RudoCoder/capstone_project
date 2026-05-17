from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Upload
from .serializers import UploadSerializer
from .tasks import process_file
from .utils import calculate_hash
from apps.analysis.models import AnalysisResult


class UploadFileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser]

    def post(self, request):
        try:
            file = request.FILES.get("file")
            if not file:
                return Response(
                    {"error": "No file provided."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # 1. Persist the upload
            upload = Upload.objects.create(
                user=request.user,
                file=file,
                file_name=file.name,
                file_type=file.content_type or "application/octet-stream",
            )

            # 2. Compute SHA-256 (resets file pointer internally)
            upload.file_hash = calculate_hash(upload.file)
            upload.save()

            # 3. Create the analysis record
            analysis = AnalysisResult.objects.create(
                upload=upload,
                status="pending"
            )

            # 4. Run the pipeline synchronously (no Redis / Celery needed in dev)
            process_file(upload.id, analysis.id)

            return Response(
                {
                    "message":     "File uploaded and analysed successfully.",
                    "analysis_id": analysis.id,
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UploadListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        uploads    = Upload.objects.filter(user=request.user).order_by("-uploaded_at")
        serializer = UploadSerializer(uploads, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
