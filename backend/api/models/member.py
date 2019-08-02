from django.db import models


class Member(models.Model):

    first_name = models.CharField(max_length=400, blank=True, default='')
    last_name = models.CharField(max_length=400, blank=True, default='')
    email = models.EmailField(blank=True)
    company = models.CharField(max_length=400, blank=True, default='')
    phone = models.CharField(max_length=400, blank=True, default='')

    class Meta:
        db_table = 'member'

    def __str__(self):
        return self.first_name

