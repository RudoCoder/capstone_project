from django.urls import path
from .views import IOCListView, AnalysisIOCView, IOCOxtractionView

urlpatterns = [
    path('', IOCListView.as_view(), name='ioc-list'),
    path('analysis/<int:analysis_id>/', AnalysisIOCView.as_view(), name='analysis-iocs'),
    path('extract/', IOCOxtractionView.as_view(), name='extract-iocs'), # New route
]
