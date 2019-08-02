from rest_framework import generics
from api.models import Product, Company, VariationType, VariationTypeAttribute, Variation, CompanyStuff
from api.serializers import ProductSerializer, VariationSerializer, VariationTypeAttributeSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
import json
from socketio_app.views import sio


class ProductView(generics.ListCreateAPIView):
    """
    Api for create and list products
    """
    serializer_class = ProductSerializer

    def get_queryset(self):
        user = self.request.user
        company_stuff = CompanyStuff.objects.filter(stuff=user, role=0).first()
        queryset = Product.objects.filter(company=company_stuff.company)
        return queryset

    def create(self, request, *args, **kwargs):
        user = self.request.user
        name = self.request.data['name']
        description = self.request.data['description']
        sku = self.request.data['sku']
        price = self.request.data['price']
        company_id = self.request.data['company']
        image = self.request.data['image']
        company = Company.objects.filter(id=company_id).first()
        product = Product.objects.create(
            name=name,
            description=description,
            image=image,
            sku=sku,
            price=price,
            company=company
        )
        product_serializer = ProductSerializer(product)

        variation_types = json.loads(self.request.data['variation_type'])
        if len(variation_types) == 1 and variation_types[0]['value'] is None:
            variation_type_entry = VariationType.objects.create(product=product, type='self_product')
            VariationTypeAttribute.objects.create(variation_type=variation_type_entry, attribute='')
            Variation.objects.create(product=product, title=name, sku=sku, image=image, price=price)
        else:
            for variation_type in variation_types:
                variation_type_attributes = variation_type['value']
                if variation_type_attributes:
                    variation_type_entry = VariationType.objects.create(product=product, type=variation_type['name'])

                    for variation_type_attribute in variation_type_attributes:
                        VariationTypeAttribute.objects.create(
                            variation_type=variation_type_entry,
                            attribute=variation_type_attribute
                        )

            variations = json.loads(self.request.data['variations'])
            for variation in variations:
                if "sku" in variation:
                    sku = variation["sku"]
                else:
                    sku = ''

                # if "image" in variation:
                #     image = variation["image"]
                # else:
                #     image = ''

                if "price" in variation:
                    price = variation["price"]
                else:
                    price = ''

                Variation.objects.create(
                    product=product,
                    title=variation['title'],
                    sku=sku,
                    image=image,
                    price=price
                )

        sio.emit('create_change_product', {
            'data': {
                'state': 'created',
                'product': product_serializer.data,
                'user': {
                    'email': user.email,
                    'id': user.id
                }
            }
        }, namespace='/test')

        return Response(product_serializer.data)


class ProductUpdateView(generics.UpdateAPIView):
    """
    Api for updating product
    """

    serializer_class = ProductSerializer

    def get_queryset(self):
        product_id = self.kwargs['pk']

    def update(self, request, *args, **kwargs):
        product_id = self.kwargs['pk']
        user = self.request.user

        name = self.request.data['name']
        description = self.request.data['description']
        sku = self.request.data['sku']
        price = self.request.data['price']
        image = self.request.data['image']
        product = Product.objects.filter(pk=product_id).first()

        if name:
            product.name = name
        if description:
            product.description = description
        if sku:
            product.sku = sku
        if price:
            product.price = price
        if image:
            product.image = image

        product.save()
        product_serializer = ProductSerializer(product)

        variations = json.loads(self.request.data['variations'])
        if variations[0].get('id'):
            for variation in variations:
                old_variation = Variation.objects.filter(id=variation['id']).first()
                if not old_variation:
                    variation = Variation(
                        title=variation["title"],
                        sku=variation["sku"],
                        price=variation["price"]
                    )
                    variation.save()
                else:
                    if variation["sku"]:
                        old_variation.sku = variation["sku"]

                    # if variation["image"]:
                    #     old_variation.image = variation["image"]

                    if variation["price"]:
                        old_variation.price = variation["price"]

                    old_variation.image = image

                    old_variation.save()

        else:
            try:
                Variation.objects.filter(product_id=product_id).delete()
                VariationType.objects.filter(product_id=product_id).delete()
            except Exception as e:
                pass

            variation_types = json.loads(self.request.data['variation_type'])
            if len(variation_types) == 1 and variation_types[0]['value'] is None:
                variation_type_entry = VariationType.objects.create(product=product, type='self_product')
                VariationTypeAttribute.objects.create(variation_type=variation_type_entry, attribute='')
                Variation.objects.create(product=product, title=name, sku=sku, image=image, price=price)
            else:
                for variation_type in variation_types:
                    variation_type_attributes = variation_type['value']
                    if variation_type_attributes:
                        variation_type_entry = VariationType.objects.create(product=product, type=variation_type['name'])
                        for variation_type_attribute in variation_type_attributes:
                            VariationTypeAttribute.objects.create(
                                variation_type=variation_type_entry,
                                attribute=variation_type_attribute
                            )

                for variation in variations:
                    if "sku" in variation:
                        sku = variation["sku"]
                    else:
                        sku = ''

                    # if "image" in variation:
                    #     image = variation["image"]
                    # else:
                    #     image = ''

                    if "price" in variation:
                        price = variation["price"]
                    else:
                        price = ''

                    Variation.objects.create(
                        product=product,
                        title=variation['title'],
                        sku=sku,
                        image=image,
                        price=price
                    )

        sio.emit('create_change_product', {
            'data': {
                'state': 'updated',
                'product': product_serializer.data,
                'user': {
                    'email': user.email,
                    'id': user.id
                }
            }
        }, namespace='/test')
        return Response(product_serializer.data)


class ProductDeleteView(generics.DestroyAPIView):
    """
    Api for deleting product
    """

    serializer_class = ProductSerializer

    def get_queryset(self):
        product_id = self.kwargs['pk']
        queryset = Product.objects.filter(pk=product_id)
        product = Product.objects.filter(pk=product_id).first()
        product_serializer = ProductSerializer(product)
        user = self.request.user
        sio.emit('create_change_product', {
            'data': {
                'state': 'deleted',
                'product': product_serializer.data,
                'user': {
                    'email': user.email,
                    'id': user.id
                }
            }
        }, namespace='/test')
        return queryset


class SearchProductView(APIView):
    """
    get product by name

    """
    def get(self, request, *args, **kwargs):
        response = []
        filter = request.query_params['filter']
        filter_json = json.loads(filter)
        user = self.request.user
        company_stuff = CompanyStuff.objects.filter(stuff=user, role=0).first()
        products = Product.objects.filter(Q(name__icontains=filter_json['arg']), company=company_stuff.company).all()
        for product in products:
            variations = Variation.objects.filter(product=product).all()
            variations_serializer = VariationSerializer(variations, many=True)
            response = response + variations_serializer.data

        return Response(response)


class VariationView(generics.ListCreateAPIView):
    """
    Api for create and list variations
    """
    serializer_class = VariationSerializer

    def get_queryset(self):
        product_id = self.kwargs['pk']
        queryset = Variation.objects.filter(product=product_id)
        return queryset


class VariationTypeAttributeView(generics.ListCreateAPIView):
    """
    Api for create and list variations
    """
    serializer_class = VariationTypeAttributeSerializer

    def get_queryset(self):
        type_id = self.kwargs['pk']
        variation_type = VariationType.objects.filter(pk=type_id).first()
        queryset = VariationTypeAttribute.objects.filter(variation_type=variation_type)
        return queryset
