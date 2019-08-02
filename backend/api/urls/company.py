from django.urls import path, include, re_path
from api.endpoint import company_view

urlpatterns = [
    re_path(r'entity/(?P<company_id>\d+)/stuff', company_view.CompanyView.as_view()),
    re_path(r'entity/(?P<company_id>\d+)', company_view.GetCompanyView.as_view()),
    re_path(r'(?P<company_id>\d+)/update', company_view.CompanyUpdateView.as_view()),
    re_path(r'(?P<company_id>\d+)/upload-avatar', company_view.UploadCompanyAvatarView.as_view()),
]

