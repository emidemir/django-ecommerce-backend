from django.shortcuts import render

from rest_framework import viewsets

from .serializers import OrderSerializer
from .models import Order

# Create your views here.
class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user.id)