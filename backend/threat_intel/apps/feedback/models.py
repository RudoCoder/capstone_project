# apps/feedback/models.py

from django.db import models
from django.contrib.auth.models import User
from apps.analysis.models import AnalysisResult


class Feedback(models.Model):

    FEEDBACK_TYPES = [
        ("correct", "Correct Detection"),
        ("false_positive", "False Positive"),
        ("false_negative", "False Negative"),
        ("improvement", "Improvement Suggestion"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    analysis = models.ForeignKey(
        AnalysisResult,
        on_delete=models.CASCADE,
        related_name="feedbacks"
    )

    feedback_type = models.CharField(max_length=20, choices=FEEDBACK_TYPES)
    comment = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} → {self.feedback_type}"
