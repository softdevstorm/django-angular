from django.db import models
from api.models import Company


class Customer(models.Model):

    first_name = models.CharField(max_length=400, blank=True, default='')
    last_name = models.CharField(max_length=400, blank=True, default='')
    email = models.EmailField(blank=True, unique=True)
    owner = models.ForeignKey(Company, on_delete=models.CASCADE, default='', null=True)
    phone = models.CharField(max_length=400, blank=True, default='', unique=True)
    address = models.CharField(max_length=400, blank=True, default='')
    city = models.CharField(max_length=400, blank=True, default='', null=True)
    country = models.CharField(max_length=400, blank=True, default='')
    image = models.ImageField(upload_to='customer', null=True, blank=True)

    class Meta:
        db_table = 'customer'

    def __str__(self):
        """TODO: Docstring for __repr__.
        :returns: TODO
        """
        return self.first_name

