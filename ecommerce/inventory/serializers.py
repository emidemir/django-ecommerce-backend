from rest_framework import serializers

from .models import Product, productImages


class ProductImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = productImages
        fields = ['url']

class ProductSerializer(serializers.ModelSerializer):
    product_image = ProductImagesSerializer(many=True, read_only=True)
    class Meta:
        model = Product
        fields = [
            'id',
            'product_name',
            'product_price',
            'product_description',
            'category',
            'product_image'
        ]