from rest_framework import generics, status
from api.models import Member, CompanyStuff, Company
from rest_framework.response import Response
from api.serializers.member_serializer import MemberSerializer
from authentication.models import User
from socketio_app.views import sio


class MemberView(generics.ListCreateAPIView):
    """
    Api for create and list customers
    """
    serializer_class = MemberSerializer

    def list(self, request):
        user = self.request.user
        company_id = CompanyStuff.objects.get(stuff_id=user.id).company_id
        member_ids = CompanyStuff.objects.filter(company_id=company_id).values('stuff_id')
        members = MemberSerializer(
            User.objects.filter(id__in=member_ids),
            many=True
        )

        return Response(members.data, status=status.HTTP_200_OK)


class MemberDeleteView(generics.DestroyAPIView):
    """
        Api for deleting customer
        """

    serializer_class = MemberSerializer

    def get_queryset(self):
        user_id = self.kwargs['pk']
        user = self.request.user
        queryset = User.objects.filter(pk=user_id)
        member = queryset.first()
        member_serializer = MemberSerializer(member)
        sio.emit('delete_member', {
            'data': {
                'state': 'deleted',
                'member': member_serializer.data,
                'user': {
                    'email': user.email,
                    'id': user.id
                }
            }
        }, namespace='/test')
        return queryset
