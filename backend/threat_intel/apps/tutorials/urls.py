# apps/tutorials/urls.py

from django.urls import path
from .views import TutorialListView, TutorialByTypeView

urlpatterns = [
    path("", TutorialListView.as_view(), name="tutorial-list"),
    path("<str:tutorial_type>/", TutorialByTypeView.as_view(), name="tutorial-by-type"),
]
