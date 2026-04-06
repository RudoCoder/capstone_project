from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser # Import these

from .models import Upload
from .serializers import UploadSerializer
from .tasks import process_file
from .utils import calculate_hash
from apps.analysis.models import AnalysisResult

class UploadFileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser] # Required for file uploads

    def post(self, request):
        try:
            file = request.FILES.get("file")

            if not file:
                return Response(
                    {"error": "No file provided"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # 1. Create the Upload instance
            upload = Upload.objects.create(
                user=request.user,
                file=file,
                file_name=file.name
            )

            # 2. Reset pointer and calculate hash using the file object
            # We pass 'upload.file' instead of '.path' to ensure it works
            # regardless of OS file locking.
            upload.file.seek(0)
            upload.file_hash = calculate_hash(upload.file)
            upload.save()

            # 3. Create analysis record
            analysis = AnalysisResult.objects.create(
                upload=upload,
                status="pending"
            )

            # 4. Run processing synchronously (No Redis needed)
            # Ensure the pointer is at the start before processing
            upload.file.seek(0)
            process_file(upload.id, analysis.id)

            return Response(
                {
                    "message": "File uploaded successfully",
                    "analysis_id": analysis.id
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            # This will print the actual traceback to your terminal for debugging
            import traceback
            print(traceback.format_exc())
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UploadListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch only the uploads belonging to the logged-in user
        uploads = Upload.objects.filter(user=request.user)
        serializer = UploadSerializer(uploads, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
