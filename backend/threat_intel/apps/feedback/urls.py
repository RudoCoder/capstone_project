# apps/feedback/urls.py

from django.urls import path
from .views import (
    SubmitFeedbackView,
    FeedbackListView,
    AnalysisFeedbackView
)

urlpatterns = [
    path("submit/", SubmitFeedbackView.as_view(), name="submit-feedback"),
    path("my/", FeedbackListView.as_view(), name="user-feedback"),
    path("analysis/<int:analysis_id>/", AnalysisFeedbackView.as_view(), name="analysis-feedback"),
]
