from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Upload
from .serializers import UploadSerializer
from .tasks import process_file
from .utils import calculate_hash

from apps.analysis.models import AnalysisResult


class UploadFileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            file = request.FILES.get("file")

            if not file:
                return Response(
                    {"error": "No file provided"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            upload = Upload.objects.create(
                user=request.user,
                file=file,
                file_name=file.name
            )

            # Generate SHA256 hash
            upload.file_hash = calculate_hash(upload.file.path)
            upload.save()

            # Create analysis record
            analysis = AnalysisResult.objects.create(
                upload=upload,
                status="pending"
            )

            # Trigger async processing
            process_file.delay(upload.id, analysis.id)

            return Response(
                {
                    "message": "File uploaded successfully",
                    "analysis_id": analysis.id
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UploadListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        uploads = Upload.objects.filter(user=request.user)
        serializer = UploadSerializer(uploads, many=True)
        return Response(serializer.data)
