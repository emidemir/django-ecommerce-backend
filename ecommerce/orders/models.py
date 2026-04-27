from django.db import models

from users.models import User, Address
from inventory.models import Product

# Create your models here.
class Order(models.Model):
    id                = models.UUIDField(primary_key=True)
    user              = models.ForeignKey(User, related_name='orders', on_delete=models.PROTECT)
    adress            = models.ForeignKey(Address, on_delete=models.PROTECT, null=True, blank=True)
    
    total_price       = models.DecimalField(max_digits=8, decimal_places=2)
    stripe_session_id = models.CharField(max_length=256, unique=True, null=True, blank=True)
    created_at        = models.DateTimeField(auto_now_add=True)
    
    class Status(models.TextChoices):
        PENDING = "Pending"
        RECEIVED = "Received"
        DELIVERED = "Delivered"
    status            = models.CharField(max_length=10, choices=Status.choices)

class OrderItem(models.Model):
    order    = models.ForeignKey(Order, related_name='order_items', on_delete=models.CASCADE)
    product  = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.IntegerField()

