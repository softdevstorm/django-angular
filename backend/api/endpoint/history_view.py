from rest_framework.views import APIView
from rest_framework.response import Response
import json
from urllib.request import urlopen
from rest_framework import generics
from api.models import History
from api.serializers import HistorySerializer


class HistoryView(APIView):
    def post(self, request, *args, **kwargs):
        get_client_ip(request)
        return Response('success')


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        print("returning FORWARDED_FOR")
        ip = x_forwarded_for.split(',')[-1].strip()
    elif request.META.get('HTTP_X_REAL_IP'):
        print("returning REAL_IP")
        ip = request.META.get('HTTP_X_REAL_IP')
    else:
        print("returning REMOTE_ADDR")
        # ip = request.META.get('REMOTE_ADDR', None)
        # url = 'http://ipinfo.io/json'
        # response = urlopen(url)
        data = request.data['data']
        device = request.data['device']

        ip = data.get('ip')
        org = data.get('org')
        city = data.get('city')
        country = data.get('country_name')
        region = data.get('region_name')
        browser_info = device.get('userAgent')
        History.objects.create(user=request.user, ip_address=ip, browser_info=browser_info, location=country)


class HistoryListView(generics.ListCreateAPIView):
    """
    Api for updating customer
    """

    serializer_class = HistorySerializer

    def get_queryset(self):
        user = self.request.user
        queryset = History.objects.filter(user=user)[:5]
        return queryset
