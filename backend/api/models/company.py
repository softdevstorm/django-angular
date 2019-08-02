from django.db import models
from authentication.models import User


class Company(models.Model):
    name = models.CharField(max_length=400, blank=True, default='')
    website = models.CharField(max_length=499, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=400, blank=True, null=True)
    avatar = models.ImageField(upload_to='company', null=True, blank=True)

    class Meta:
        db_table = 'company'

    def __str__(self):
        """TODO: Docstring for __repr__.
        :returns: TODO
        """
        return self.name


class CompanyStuff(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    stuff = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.IntegerField(default=0)

    class Meta:
        db_table = 'company_stuff'

    def __str__(self):
        """TODO: Docstring for __repr__.
        :returns: TODO
        """
        return self.company.name
