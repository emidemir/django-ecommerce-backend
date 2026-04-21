from django.contrib import admin

from .models import User, Cart, CartItem, Comment

# Register your models here.
admin.site.register(User)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Comment)