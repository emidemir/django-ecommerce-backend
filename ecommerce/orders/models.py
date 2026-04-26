from django.db import models

from users.models import User
from inventory.models import Product

# Create your models here.
class Order(models.Model):
    id                = models.UUIDField(primary_key=True)
    total_price       = models.DecimalField(max_digits=8, decimal_places=2)
    user              = models.ForeignKey(User, related_name='orders', on_delete=models.PROTECT)
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

