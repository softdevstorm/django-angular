# Generated by Django 2.1.3 on 2019-03-30 07:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0020_auto_20190330_0704'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customer',
            name='image',
            field=models.CharField(blank=True, default='', max_length=400),
        ),
    ]
