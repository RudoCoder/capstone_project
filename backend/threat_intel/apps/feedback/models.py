# apps/feedback/models.py

from django.db import models
from django.conf import settings  # Updated
from apps.analysis.models import AnalysisResult

class Feedback(models.Model):
    FEEDBACK_TYPES = [
        ("correct", "Correct Detection"),
        ("false_positive", "False Positive"),
        ("false_negative", "False Negative"),
        ("improvement", "Improvement Suggestion"),
    ]

    # Updated to use settings.AUTH_USER_MODEL
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    analysis = models.ForeignKey(
        AnalysisResult,
        on_delete=models.CASCADE,
        related_name="feedbacks"
    )

    feedback_type = models.CharField(max_length=20, choices=FEEDBACK_TYPES)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # Access username normally; it works for CustomUser too
        return f"{self.user.username} → {self.feedback_type}"
