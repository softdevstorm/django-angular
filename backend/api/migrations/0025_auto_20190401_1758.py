# Generated by Django 2.1.3 on 2019-04-01 17:58

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0024_feature_installedfeature'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customer',
            name='company',
        ),
        migrations.AlterField(
            model_name='customer',
            name='owner',
            field=models.ForeignKey(default='', null=True, on_delete=django.db.models.deletion.CASCADE, to='api.Company'),
        ),
    ]
