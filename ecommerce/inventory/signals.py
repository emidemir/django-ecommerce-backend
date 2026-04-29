from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from inventory.models import Product
from django.core.cache import cache

@receiver([post_save, post_delete], sender=Product)
def invalidate_product_cache(sender, instance, **kwargs):

    # https://github.com/jazzband/django-redis#scan--delete-keys-in-bulk
    # .delete_pattern('...') doesn't exist in the original django redis code. You must use (pip install django-redis)
    # package in order to use this method
    cache.delete_pattern('*product_list*')
