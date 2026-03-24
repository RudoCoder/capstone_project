# apps/yara_engine/urls.py

from django.urls import path
from .views import YaraRuleListView, YaraMatchView

urlpatterns = [
    path("rules/", YaraRuleListView.as_view(), name="yara-rules"),
    path("matches/<int:analysis_id>/", YaraMatchView.as_view(), name="yara-matches"),
]
