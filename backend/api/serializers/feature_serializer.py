from rest_framework import serializers
from api.models import Feature


class FeatureSerializer(serializers.ModelSerializer):

    class Meta:
        model = Feature
        fields = ('id', 'name', 'description')
