from django.shortcuts import render
from django.contrib.auth import authenticate

from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import viewsets

from rest_framework_simplejwt.tokens import RefreshToken

from users.models import User, CartItem, Cart, Comment, Address
from .serializers import UserSerializer, CartItemSerializer, CartSerializer, CommentSerializer, AddressSerializer

from django.core.exceptions import ObjectDoesNotExist
# from django.core.exceptions import MultipleObjectsReturned

@api_view(['POST'])
@permission_classes([AllowAny])
def LoginView(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'msg':'Password and email are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except ObjectDoesNotExist:
        return Response({'msg': 'There is no registered user with that email!'}, status=status.HTTP_400_BAD_REQUEST)
    # except MultipleObjectsReturned:
    # Do something that notifies an admin

    user = authenticate(request, username=user.username, password=password)
    if not user:
        return Response({'msg':'Wrong password'}, status=status.HTTP_400_BAD_REQUEST)

    refresh = RefreshToken.for_user(user)

    return Response({'msg':'Login succesfull', 'refresh': str(refresh), 'access': str(refresh.access_token), 'userID': str(user.id), 'cartID': str(user.cart.id)}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def RegisterView(request):
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    email = request.data.get('email')
    password = request.data.get('password')

    if not first_name or not last_name or not email or not password:
        return Response({'msg':'A field is missing'}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(email=email).exists():
        return Response({'msg':'A user with the given email already exists'}, status=status.HTTP_400_BAD_REQUEST)

    new_user = User.objects.create_user(
        username=f"{first_name}-{last_name}",
        first_name=first_name,
        last_name=last_name,
        email=email,
        password=password)

    refresh = RefreshToken.for_user(new_user)
    
    cart, _ = Cart.objects.get_or_create(user=new_user)

    return Response({'msg':'Register succesfull', 'refresh': str(refresh), 'access': str(refresh.access_token), 'userID': str(new_user.id), 'cartID': str(cart.id)}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def LogoutView(request):
    try:
        refresh_token = request.data.get("refresh")
        token = RefreshToken(refresh_token)
        token.blacklist()

        return Response({"msg": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response({"error": "Invalid token or token already blacklisted."}, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ModelViewSet):    
    serializer_class = UserSerializer
    lookup_field = 'pk'

    def get_queryset(self):
        return User.objects.filter(email = self.request.user.email)

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user.id)

class CartItemViewSet(viewsets.ModelViewSet):
    
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer

    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        cart = Cart.objects.get(user=self.request.user)

        existing_item = CartItem.objects.filter(cart=cart, product=product).first()

        if existing_item:
            existing_item.quantity += serializer.validated_data['quantity']
            existing_item.save()
        else:
            serializer.save(cart=cart)

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer

    def get_queryset(self):
        # Django automatically creates two ways to reference this field:
        # product → expects a Product object
        # product_id → expects a raw integer (the ID)
        
        queryset = Comment.objects.all()
        product_id = self.request.query_params.get('product')

        if product_id:
            queryset = queryset.filter(product_id=product_id)

        return queryset
    
class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user.id)