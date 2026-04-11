# apps/tutorials/models.py

from django.db import models


class Tutorial(models.Model):

    TUTORIAL_TYPES = [
        ("document", "Google Drive Document"),
        ("video", "YouTube Video"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    url = models.URLField()
    tutorial_type = models.CharField(max_length=20, choices=TUTORIAL_TYPES)

    order = models.PositiveIntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return self.title
