import json
from rest_framework import generics
from api.models import Customer, Company, CompanyStuff
from rest_framework.response import Response
from api.serializers import CustomerSerializer
from authentication.serializers import UserSerializer
from authentication.models import User
from rest_framework.views import APIView
from django.db.models import Q
from socketio_app.views import sio


class CustomerView(generics.ListCreateAPIView):
    """
    Api for create and list customers
    """
    serializer_class = CustomerSerializer

    def get_queryset(self):
        user = self.request.user
        owner_id = CompanyStuff.objects.filter(stuff=user).values('company_id').first().get('company_id')
        owner = Company.objects.filter(pk=owner_id).first()
        queryset = Customer.objects.filter(owner=owner)
        return queryset

    def post(self, request, *args, **kwargs):
        user = self.request.user
        first_name = self.request.data.get('first_name')
        last_name = self.request.data.get('last_name')
        email = self.request.data.get('email')
        owner_id = self.request.data.get('owner')
        owner = Company.objects.filter(pk=owner_id).first()
        phone = self.request.data.get('phone')
        address = self.request.data.get('address')
        city = self.request.data.get('city')
        country = self.request.data.get('country')
        image = self.request.data.get('image')

        try:
            match_email = Customer.objects.get(email=email)
        except Exception as e:
            match_email = None

        try:
            match_phone = Customer.objects.get(phone=phone)
        except Exception as e:
            match_phone = None

        if match_email or match_phone:
            return Response({'status': 'failed'})

        customer = Customer.objects.create(
            first_name=first_name,
            last_name=last_name,
            email=email,
            owner=owner,
            phone=phone,
            address=address,
            city=city,
            country=country,
            image=image)
        customer_serializer = CustomerSerializer(customer)
        sio.emit('create_change_customer', {
            'data': {
                'state': 'created',
                'customer': customer_serializer.data,
                'user': {
                    'email': user.email,
                    'id': user.id
                }
            }
        }, namespace='/test')
        return Response(customer_serializer.data)


class CustomerUpdateView(generics.UpdateAPIView):
    """
    Api for updating customer
    """

    serializer_class = CustomerSerializer

    def get_queryset(self):
        customer_id = self.kwargs['pk']

    def update(self, request, *args, **kwargs):
        customer_id = self.kwargs['pk']
        user = self.request.user
        first_name = self.request.data.get('first_name')
        last_name = self.request.data.get('last_name')
        email = self.request.data.get('email')
        phone = self.request.data.get('phone')
        address = self.request.data.get('address')
        city = self.request.data.get('city')
        country = self.request.data.get('country')
        image = self.request.data.get('image')

        customer = Customer.objects.filter(pk=customer_id).first()

        customer.first_name = first_name
        customer.last_name = last_name
        customer.email = email
        customer.phone = phone
        customer.address = address
        customer.city = city
        customer.country = country
        customer.image = image

        customer.save()
        customer_serializer = CustomerSerializer(customer)

        sio.emit('create_change_customer', {
            'data': {
                'state': 'updated',
                'customer': customer_serializer.data,
                'user': {
                    'email': user.email,
                    'id': user.id
                }
            }
        }, namespace='/test')
        return Response(customer_serializer.data)


class CustomerDeleteView(generics.DestroyAPIView):
    """
    Api for deleting customer
    """

    serializer_class = CustomerSerializer

    def get_queryset(self):
        customer_id = self.kwargs['pk']
        user = self.request.user
        queryset = Customer.objects.filter(pk=customer_id)
        customer = Customer.objects.filter(pk=customer_id).first()
        customer_serializer = CustomerSerializer(customer)
        sio.emit('create_change_customer', {
            'data': {
                'state': 'deleted',
                'customer': customer_serializer.data,
                'user': {
                    'email': user.email,
                    'id': user.id
                }
            }
        }, namespace='/test')
        return queryset


class SearchCustomerView(APIView):
    """
    search user by username or email

    """
    def get(self, request, *args, **kwargs):
        user_id = self.request.user.id
        filter = request.query_params['filter']
        filter_json = json.loads(filter)
        customers = User.objects.filter(Q(email__icontains=filter_json['arg'])).exclude(id=user_id).all()
        customers_serializer = UserSerializer(customers, many=True)
        return Response(customers_serializer.data)
