# Generated by Django 2.1.3 on 2019-02-18 21:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_customer_address'),
    ]

    operations = [
        migrations.AddField(
            model_name='customer',
            name='image',
            field=models.CharField(blank=True, default='', max_length=400),
        ),
    ]