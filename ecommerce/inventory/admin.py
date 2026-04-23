from django.contrib import admin

from .models import Product, productImages

# Register your models here.
admin.site.register(Product)
admin.site.register(productImages)