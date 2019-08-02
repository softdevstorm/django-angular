from django.urls import path, include, re_path
from api.endpoint import feature_view

urlpatterns = [
    re_path(r'list', feature_view.FeatureListView.as_view()),
]