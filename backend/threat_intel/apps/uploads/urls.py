from django.urls import path
from .views import UploadFileView, UploadListView

urlpatterns = [
    path("upload/", UploadFileView.as_view(), name="upload-file"),
    path("list/", UploadListView.as_view(), name="upload-list"),
]
