from django.db import models

from users.models import Profile
from inventory.models import Product

# Create your models here.
class Order(models.Model):
    id                = models.UUIDField()
    total_price       = models.DecimalField(max_digits=8, decimal_places=2)
    user_profile      = models.OneToOneField(Profile)
    products          = models.ForeignKey(Product)
    

