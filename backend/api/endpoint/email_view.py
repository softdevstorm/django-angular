from django.contrib.auth.tokens import default_token_generator
from templated_mail.mail import BaseEmailMessage
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from authentication.conf import settings
from django.core.mail import send_mail
from api.models import CompanyStuff
from django.template import Context
from django.template.loader import render_to_string
from rest_framework.response import Response

from authentication.models import User

import uuid


class InvitationView(APIView):
    def post(self, request, *args, **kwargs):
        to_email = request.data['email']

        user = self.request.user
        invited_user = User.objects.create_user(email=to_email, password=str(uuid.uuid4()), is_active=False)

        companystuff = CompanyStuff.objects.filter(stuff=user).first()
        company = companystuff.company
        # token = default_token_generator.make_token(invited_user)
        token = Token.objects.create(user=invited_user)

        c = Context({'token': token, 'store': company.name})
        msg_plain = render_to_string(['email/invitation.html'], {'token': token, 'store': company.name})
        msg_html = render_to_string(['email/invitation.html'], {'token': token, 'store': company.name})

        response = send_mail(
            subject='Invitation to dropify',
            message=msg_plain,
            from_email='contact@dropify.net',
            recipient_list=[to_email],
            html_message=msg_html,
        )

        return Response(response)


class ActivationEmail(BaseEmailMessage):
    template_name = 'email/invitation.html'

    def get_context_data(self):
        context = super(ActivationEmail, self).get_context_data()
        user = context.get('user')
        company_id = user.company_id
        company_name = user.company
        context['store'] = company_name
        context['token'] = default_token_generator.make_token(company_id)
        context['url'] = settings.INVITATION_URL.format(**context)
        return context
