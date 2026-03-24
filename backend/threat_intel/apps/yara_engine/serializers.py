# apps/yara_engine/serializers.py

from rest_framework import serializers
from .models import YaraRule, YaraMatch


class YaraRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = YaraRule
        fields = "__all__"


class YaraMatchSerializer(serializers.ModelSerializer):
    rule = YaraRuleSerializer(read_only=True)

    class Meta:
        model = YaraMatch
        fields = "__all__"
