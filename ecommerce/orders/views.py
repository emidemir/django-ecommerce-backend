from django.shortcuts import redirect, render
from django.conf import settings
from django.core import serializers
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework import status

from .serializers import OrderSerializer
from .models import Order, OrderItem
from users.models import User, Cart
from inventory.models import Product

import stripe
import json

# Create your views here.
class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user.id)

stripe.api_key = settings.STRIPE_SECRET_KEY
@api_view(['POST'])
def stripeCheckoutCreationView(request):
    cart = Cart.objects.get(user=request.user.id)
    cartItems = cart.items.all()

    product_ids = [str(getattr(getattr(item, 'product'), 'id')) for item in cartItems]
    products = Product.objects.filter(id__in=product_ids)
    products_by_id = {str(p.id): p for p in products}
    
    line_items = []
    for item in cartItems:
        product = products_by_id[str(getattr(getattr(item, 'product'), 'id'))]
        line_items.append({
            "price_data": {
                "currency": settings.STRIPE_CURRENCY,
                "unit_amount": int(product.product_price * 100),
                "product_data": {"name": product.product_name},
            },
            "quantity": getattr(item, 'quantity'),
        })

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        mode="payment",
        line_items=line_items,
        success_url="http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url="http://localhost:3000/checkout/cancelled",
        metadata={
            "user_id": str(request.user.id),
            "cart": serializers.serialize("json", cartItems)
        }
    )

    return Response(data={'url':session.url}, status=status.HTTP_200_OK)


@csrf_exempt
def stripeWebhookView(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        return HttpResponse(status=400)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        handle_successful_payment(session)

    return HttpResponse(status=200)

def handle_successful_payment(session):
    if session.get("payment_status") != "paid":
        return

    stripe_session_id = session["id"]
    if Order.objects.filter(stripe_session_id=stripe_session_id).exists():
        return

    user = User.objects.get(id=session["metadata"]["user_id"])

    # Django's serializer format needs deserializing differently than plain JSON
    cart_items = serializers.deserialize("json", session["metadata"]["cart"])

    with transaction.atomic():
        order = Order.objects.create(
            user=user,
            amount=session["amount_total"] / 100,
            stripe_session_id=stripe_session_id,
            status="completed",
        )
        for deserialized_item in cart_items:
            item = deserialized_item.object  # the actual CartItem instance
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                unit_price=item.product.product_price,
            )