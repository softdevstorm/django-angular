from rest_framework import serializers
from authentication.models import User


class MemberSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email', 'phone')
