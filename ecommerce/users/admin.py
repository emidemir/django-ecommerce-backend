from django.contrib import admin

from .models import User, Cart, CartItem

# Register your models here.
admin.site.register(User)
admin.site.register(Cart)
admin.site.register(CartItem)