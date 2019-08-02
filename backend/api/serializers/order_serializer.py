from rest_framework import serializers
from api.models import Order, Customer, Product, Variation, Company
from api.serializers import CustomerSerializer
from api.serializers import ProductSerializer, VariationSerializer, CompanySerializer
from authentication.serializers import UserSerializer
from authentication.models import User


class OrderSerializer(serializers.ModelSerializer):
    customer_info = serializers.SerializerMethodField('get_customer')

    def get_customer(self, order):
        customer = Customer.objects.filter(id=order.customer_id).first()
        if customer:
            serial_customer = CustomerSerializer(customer)
            return serial_customer.data
        else:
            return None

    products_info = serializers.SerializerMethodField('get_products')

    def get_products(self, order):
        products = Variation.objects.filter(pk__in=order.products).all()
        if products:
            serial_product = VariationSerializer(products, many=True)
            return serial_product.data
        else:
            return None

    company_info = serializers.SerializerMethodField('get_company')

    def get_company(self, order):
        company = Company.objects.filter(pk=order.owner_id).first()
        if company:
            serial_company = CompanySerializer(company)
            return serial_company.data
        else:
            return None

    class Meta:
        model = Order
        fields = ('id', 'products', 'amounts', 'customer', 'owner', 'total_price', 'total_tax', 'payment', 'fulfillment'
                  , 'created_at', 'updated_at', 'customer_info', 'status', 'status_type', 'products_info', 'company_info')
