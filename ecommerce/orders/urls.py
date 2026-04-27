from django.urls import path, include

from .views import OrderViewSet,stripeCheckoutCreationView, stripeWebhookView

from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(prefix=r'orders', viewset=OrderViewSet, basename='order')


urlpatterns = [
    path('', include(router.urls)),
    path('checkout/', stripeCheckoutCreationView, name='stripe_checkout'),
    path('webhook/', stripeWebhookView, name='stripe_webhook'),
]