from django.db import models
from authentication.models import User


class Feature(models.Model):

    name = models.CharField(max_length=400, blank=True, default='')
    description = models.CharField(max_length=400, blank=True, default='')

    class Meta:
        db_table = 'feature'

    def __str__(self):
        """TODO: Docstring for __repr__.
        :returns: TODO
        """
        return self.name


class InstalledFeature(models.Model):

    feature = models.ForeignKey(Feature, on_delete=models.CASCADE, blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)

    class Meta:
        db_table = 'installed_feature'

    def __str__(self):
        """TODO: Docstring for __repr__.
        :returns: TODO
        """
        return self.feature_id
