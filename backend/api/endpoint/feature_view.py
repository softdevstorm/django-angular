from rest_framework import generics
from api.serializers import FeatureSerializer
from api.models import Feature, InstalledFeature


class FeatureListView(generics.ListCreateAPIView):
    """
    Api for Fetching Features data
    """

    serializer_class = FeatureSerializer

    def get_queryset(self):
        user = self.request.user
        # installed_feature = InstalledFeature.objects.filter(user=user).get('feature_id')
        queryset = Feature.objects.all()
        return queryset
