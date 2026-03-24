# apps/cve/urls.py

from django.urls import path
from .views import CVEListView, CVEMatchView

urlpatterns = [
    path("", CVEListView.as_view(), name="cve-list"),
    path("matches/<int:analysis_id>/", CVEMatchView.as_view(), name="cve-matches"),
]
