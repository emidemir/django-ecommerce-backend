from django.urls import path, include

from rest_framework.routers import DefaultRouter

from .views import ProductViewSet, SearchView, getSuggestedItems

router = DefaultRouter()
router.register(prefix=r'products', viewset=ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
    path('search-product/<str:text>/', SearchView, name='searchbar'),
    path('suggesteds/<str:productID>/', getSuggestedItems, name='suggested_items'),
]