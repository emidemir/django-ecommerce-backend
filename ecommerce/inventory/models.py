from django.db import models

class Product(models.Model):
    id                  = models.UUIDField()
    product_name        = models.CharField(max_length=100)
    product_price       = models.DecimalField(max_digits=7, decimal_places=2)
    product_description = models.TextField()

def product_image_path(instance, file):
    return '/'.join(['product-images/', instance.product.id])

# Store product images in a SW3 bucket and get them when product is viewed. This table only holds the urls of the images
class productImages(models.Model):
    product             = models.OneToOneField(Product, related_name="product_image")
    url                 = models.ImageField(upload_to=product_image_path)
