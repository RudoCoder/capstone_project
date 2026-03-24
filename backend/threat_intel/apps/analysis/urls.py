# apps/analysis/urls.py

from django.urls import path
from .views import AnalysisDetailView

urlpatterns = [
    path("<int:id>/", AnalysisDetailView.as_view(), name="analysis-detail"),
]
