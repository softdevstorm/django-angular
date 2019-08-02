from rest_framework import generics, views, status
from api.models import Company, CompanyStuff
from api.serializers import CompanySerializer, CompanyStuffSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from api.models import Company
from socketio_app.views import sio


class CompanyView(generics.ListCreateAPIView):
    serializer_class = CompanyStuffSerializer

    def get_queryset(self):
        company_id = self.kwargs['company_id']
        company = Company.objects.filter(id=company_id).first()
        queryset = CompanyStuff.objects.filter(company=company)
        return queryset


class GetCompanyView(APIView):

    def get(self, request, *args, **kwargs):
        company_id = self.kwargs['company_id']
        company = Company.objects.filter(id=company_id).first()
        company_serializer = CompanySerializer(company)
        return Response(company_serializer.data)


class CompanyUpdateView(generics.UpdateAPIView):
    """
    Api for updating customer
    """

    serializer_class = CompanySerializer

    def get_queryset(self):
        company_id = self.kwargs['company_id']

    def update(self, request, *args, **kwargs):
        company_id = self.kwargs['company_id']
        data = self.request.data
        name = data.get('name')
        website = data.get('website')
        email = data.get('email')
        phone = data.get('phone')
        user = self.request.user

        company = Company.objects.filter(pk=company_id).first()
        company.name = name
        company.website = website
        company.email = email
        company.phone = phone

        company.save()
        company_serializer = CompanySerializer(company)

        sio.emit('create_change_company', {
            'data': {
                'state': 'updated',
                'customer': company_serializer.data,
                'user': {
                    'email': user.email,
                    'id': user.id
                }
            }
        }, namespace='/test')
        return Response(company_serializer.data)


class UploadCompanyAvatarView(views.APIView):
    """
    Use this endpoint to upload company avatar.
    """
    def post(self, request, *args, **kwargs):
        try:
            company_id = self.kwargs['company_id']
            company = Company.objects.filter(pk=company_id).first()
            avatar = request.data.get('file', None)
            if avatar.size > 800 * 1024:
                return Response({'success': 'File is too large'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                company.avatar = avatar
                company.save()
            return Response({'success': 'success'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'success': str(e)}, status=status.HTTP_400_BAD_REQUEST)
