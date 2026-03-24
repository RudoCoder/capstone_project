# apps/analysis/urls.py

from django.urls import path
from .views import (
    AnalysisDetailView,
    AnalysisListView,
    RiskTrendView,
)

urlpatterns = [
    path("", AnalysisListView.as_view()),
    path("<int:pk>/", AnalysisDetailView.as_view()),
    path("risk-trends/", RiskTrendView.as_view()),
]
