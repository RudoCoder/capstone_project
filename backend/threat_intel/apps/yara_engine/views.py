# apps/yara_engine/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import YaraRule, YaraMatch
from .serializers import YaraRuleSerializer, YaraMatchSerializer


class YaraRuleListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rules = YaraRule.objects.all()
        serializer = YaraRuleSerializer(rules, many=True)
        return Response(serializer.data)


class YaraMatchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, analysis_id):
        matches = YaraMatch.objects.filter(
            analysis_id=analysis_id
        ).select_related("rule")

        serializer = YaraMatchSerializer(matches, many=True)
        return Response(serializer.data)
