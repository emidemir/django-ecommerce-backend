from rest_framework import serializers

from inventory.serializers import ProductSerializer
from .models import User, Cart, CartItem, Comment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ('password', )

class CartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = '__all__'

class CartItemGetSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)  # No many=True, it's a single FK

    class Meta:
        model = CartItem
        fields = '__all__'

class CartSerializer(serializers.ModelSerializer):
    items = CartItemGetSerializer(many=True, read_only=True)  # many=True here

    class Meta:
        model = Cart
        fields = ('user', 'items')

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields= ['date']