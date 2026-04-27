from django.urls import path, include

from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView, TokenVerifyView
from .views import LoginView, RegisterView, LogoutView, UserViewSet, CartItemViewSet, CartViewSet, CommentViewSet, AddressViewSet

from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'cartitems', CartItemViewSet, basename='cartitem')
router.register(r'carts', CartViewSet, basename='cart')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'addresses', AddressViewSet, basename='address')

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('login/', LoginView, name='login_view'),
    path('register/', RegisterView, name='register_view'),
    path('logout/', LogoutView, name='logout_view'),   
    path('', include(router.urls)),
]