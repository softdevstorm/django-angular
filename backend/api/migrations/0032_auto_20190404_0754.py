# Generated by Django 2.1.3 on 2019-04-04 07:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0031_auto_20190404_0636'),
    ]

    operations = [
        migrations.AlterField(
            model_name='variation',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='product'),
        ),
    ]
