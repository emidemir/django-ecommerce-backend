from django.db import models

class Product(models.Model):
    id                  = models.UUIDField(primary_key=True)
    product_name        = models.CharField(max_length=100)
    product_price       = models.DecimalField(max_digits=7, decimal_places=2)
    product_description = models.TextField()

    class Categories(models.TextChoices):
        ELECTRONICS = "ELECTRONICS", "Electronics"
        ACCESSSORIES = "ACCESSORIES", "Accessories"
        BAGS = "BAGS", "Bags"
        HOME_LIVING = "HOME_LIVING", "Home & Living"
    category            = models.CharField(max_length=11, choices=Categories.choices, null=True, blank=True)

def product_image_path(instance, file):
    return '/'.join([f'{str(instance.product.id)}/',file])

# Store product images in a SW3 bucket and get them when product is viewed. This table only holds the urls of the images
class productImages(models.Model):
    product             = models.ForeignKey(Product, related_name="product_image", on_delete= models.CASCADE)
    url                 = models.ImageField(upload_to=product_image_path)


