# apps/analysis/urls.py

from django.urls import path
from .views import AnalysisListView, AnalysisDetailView, RiskTrendView

urlpatterns = [
    # 1. Base list of analyses (Matches /api/analysis/)
    path("", AnalysisListView.as_view(), name="analysis-list"),

    # 2. Risk trends for the chart (Matches /api/analysis/risk-trends/)
    path("risk-trends/", RiskTrendView.as_view(), name="risk-trends"),

    # 3. Specific detail view (Matches /api/analysis/5/)
    path("<int:id>/", AnalysisDetailView.as_view(), name="analysis-detail"),
]
