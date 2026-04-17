# apps/analysis/urls.py

from django.urls import path
from .views import AnalysisListView, AnalysisDetailView, RiskTrendView, MLInsightsView

urlpatterns = [
    path("", AnalysisListView.as_view(), name="analysis-list"),
    path("risk-trends/", RiskTrendView.as_view(), name="risk-trends"),
    path("ml-insights/", MLInsightsView.as_view(), name="ml-insights"),
    path("<int:id>/", AnalysisDetailView.as_view(), name="analysis-detail"),
]
