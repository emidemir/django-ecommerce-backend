from django.shortcuts import render

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from rest_framework.decorators import api_view, renderer_classes

from elasticsearch_dsl.query import MultiMatch
from elasticsearch_dsl import Q
from ecommerce.documents import ProductDocument

from .models import Product
from .serializers import ProductSerializer
# Create your views here.



class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'pk'

#https://django-elasticsearch-dsl.readthedocs.io/en/latest/quickstart.html#search
#https://elasticsearch-dsl.readthedocs.io/en/latest/search_dsl.html#the-search-object
@api_view(['GET'])
def SearchView(request, text):
    search = ProductDocument.search()
    
    # Build the multi-match query
    query = Q(
        'multi_match',
        query=text,
        fields=["product_name", "category"],
        fuzziness='AUTO',
        type='best_fields',
    )

    # Apply the query
    search = search.query(query)

    # Convert the Elasticsearch hits directly into a Django QuerySet
    queryset = search.to_queryset()

    # Serialize the QuerySet
    serializer = ProductSerializer(queryset, many=True)

    # Return the clean, serialized data
    return Response(data=serializer.data, status=HTTP_200_OK)