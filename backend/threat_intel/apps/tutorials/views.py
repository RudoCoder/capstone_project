# apps/tutorials/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Tutorial
from .serializers import TutorialSerializer


class TutorialListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tutorials = Tutorial.objects.all()
        serializer = TutorialSerializer(tutorials, many=True)
        return Response(serializer.data)


class TutorialByTypeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, tutorial_type):
        tutorials = Tutorial.objects.filter(
            tutorial_type=tutorial_type
        ).order_by("-created_at")

        serializer = TutorialSerializer(tutorials, many=True)
        return Response(serializer.data)
