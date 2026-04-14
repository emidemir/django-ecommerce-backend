from django.db import models

from users.models import Profile
from inventory.models import Product

# Create your models here.
class Order(models.Model):
    id                = models.UUIDField(primary_key=True)
    total_price       = models.DecimalField(max_digits=8, decimal_places=2)
    user_profile      = models.OneToOneField(Profile, on_delete=models.PROTECT)
    products          = models.ForeignKey(Product, on_delete=models.CASCADE)