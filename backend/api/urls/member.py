from django.urls import path, include, re_path
from api.endpoint import member_view

urlpatterns = [
    re_path(r'entity', member_view.MemberView.as_view()),
    # re_path(r'search', member_view.SearchCustomerView.as_view()),
    # re_path(r'(?P<pk>\d+)/update', member_view.CustomerUpdateView.as_view()),
    re_path(r'(?P<pk>\d+)/delete', member_view.MemberDeleteView.as_view()),
]