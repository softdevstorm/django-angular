from rest_framework import serializers
from api.models import Customer, Order


class CustomerSerializer(serializers.ModelSerializer):

    order_count = serializers.SerializerMethodField('get_order')

    def get_order(self, customer):
        order = Order.objects.filter(customer=customer).count()
        if order:
            return order
        else:
            return None

    class Meta:
        model = Customer
        fields = ('id', 'first_name', 'last_name', 'email', 'owner', 'phone', 'address', 'city', 'country', 'image',
                  'order_count')

