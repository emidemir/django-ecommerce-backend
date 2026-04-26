from .models import Order, OrderItem

from inventory.models import Product
from inventory.serializers import ProductSerializer

from rest_framework import serializers


class OrderItemSerializer(serializers.ModelSerializer):
    # Write: accepts only a product id
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = OrderItem
        fields = ['product', 'quantity']

    def to_representation(self, instance):
        # Read: swap the id out for the full nested product
        rep = super().to_representation(instance)
        rep['product'] = ProductSerializer(instance.product).data
        return rep


class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['total_price', 'order_items']

    def create(self, validated_data):
        items_data = validated_data.pop('order_items')
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        return order