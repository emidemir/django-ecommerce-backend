from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Profile, Cart, CartItem

from django.contrib.auth import get_user_model

User = get_user_model()



@receiver(post_save, sender=User)
def create_user_profile_and_cart(sender, instance, created,**kwargs):
    if created:
        Profile.objects.create(user=instance)
        Cart.objects.create(user=instance)
