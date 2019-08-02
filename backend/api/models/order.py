from django.db import models
from django.contrib.postgres.fields import ArrayField
from api.models import Product, Customer, Company
from authentication.models import User


class Order(models.Model):
    products = ArrayField(models.IntegerField(default=0))
    amounts = ArrayField(models.IntegerField(default=0), default=list)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    # owner = models.IntegerField(default=0)
    owner = models.ForeignKey(Company, on_delete=models.CASCADE, null=True)
    total_price = models.FloatField(default=0)
    total_tax = models.FloatField(default=0)
    payment = models.IntegerField(default=0)                # 0: pending, 1: paid
    fulfillment = models.IntegerField(default=0)                # 0: unfulfilled, 1: fulfilled
    status = models.CharField(max_length=100, null=True, blank=True)
    status_type = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'order'

    def __str__(self):
        """TODO: Docstring for __repr__.
        :returns: TODO
        """
        return self.id

