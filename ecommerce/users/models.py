import uuid

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from django.conf import settings

from phonenumber_field.modelfields import PhoneNumberField
from django_countries.fields import CountryField

from inventory.models import Product

# Create your models here.
class User(AbstractUser):
    id           =  models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

def user_profile_photo(instance, filename):
    return '/'.join(['content', instance.user.first_name, '-', instance.user.last_name, filename])

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL ,on_delete=models.CASCADE)
    profile_photo = models.ImageField(upload_to=user_profile_photo, null=True, blank=True)
    phone_number =  PhoneNumberField(blank=True, null=True)
    role         =  models.CharField(max_length=50, blank=True, null=True)
    is_active    =  models.BooleanField(null=True, blank=True)
    is_verified  =  models.BooleanField(null=True, blank=True)
    created_at   =  models.DateTimeField(null=True, blank=True)
    updated_at   =  models.DateTimeField(null=True, blank=True)
    deleted_at   =  models.DateTimeField(null=True, blank=True)

class Address(models.Model):
    user              =  models.ForeignKey(User, related_name="address", on_delete=models.CASCADE)
    country           =  CountryField(blank=False, null=False)
    city              =  models.CharField(max_length=100, blank=False, null=False)
    district          =  models.CharField(max_length=100, blank=False, null=False)
    street_address    =  models.CharField(max_length=250, blank=False, null=False)
    postal_code       =  models.CharField(max_length=20, blank=True, null=True)
    primary           =  models.BooleanField(default=False)
    phone_number      =  PhoneNumberField(null=True, blank=True)
    building_number   =  models.IntegerField(
        blank=True, null=True, validators=[MinValueValidator(1)]
    )
    apartment_number  =  models.IntegerField(
        blank=True, null=True, validators=[MinValueValidator(1)]
    )

class Cart(models.Model):
    user        = models.OneToOneField(User, related_name="cart", on_delete=models.CASCADE)
    products    = models.ForeignKey(Product, on_delete=models.PROTECT)
    total_price = models.DecimalField(max_digits=8, decimal_places=2)
    