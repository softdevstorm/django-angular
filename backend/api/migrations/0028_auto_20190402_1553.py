# Generated by Django 2.1.3 on 2019-04-02 15:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0027_remove_variation_barcode'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='image',
            field=models.TextField(blank=True, default='', null=True),
        ),
    ]
