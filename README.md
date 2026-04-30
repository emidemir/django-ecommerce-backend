# Django E-Commerce Backend

This project was built primarily to solidify my understanding of backend development and modern infrastructure by learning through practice. Rather than building a simple CRUD app, I integrated a robust stack of industry-standard technologies to handle search, caching, rate limiting, and containerization.

The core objective of this repository is to demonstrate *how* these technologies work together within a Django environment.

---

## Tech Stack

| Technology | Role |
|---|---|
| **Django + DRF** | Core framework & REST API |
| **PostgreSQL + PGVector** | Relational database & vector similarity search |
| **ElasticSearch** | Full-text product search |
| **Redis** | Caching & rate limiting |
| **MinIO** | S3-compatible object storage for product images |
| **Stripe** | Payment processing |
| **Docker + Docker Compose** | Containerization & service orchestration |
| **Swagger (drf-yasg)** | Interactive API documentation |

---

## Table of Contents

1. [Docker & Docker Compose](#1-docker--docker-compose)
2. [ElasticSearch (Text Search)](#2-elasticsearch-text-search)
3. [MinIO (Object Storage)](#3-minio-object-storage)
4. [PostgreSQL & PGVector (Database & Recommendations)](#4-postgresql--pgvector-database--recommendations)
5. [Stripe (Payment Integration)](#5-stripe-payment-integration)
6. [Caching (Redis)](#6-caching-redis)
7. [Rate Limiting (Custom Middleware)](#7-rate-limiting-custom-middleware)
8. [API Documentation (Swagger)](#8-api-documentation-swagger--drf-yasg)

---

## 1. Docker & Docker Compose

To ensure this project runs consistently across different environments, all services are containerized using Docker.

**Getting Started:** If you don't have Docker installed, download it from the [Docker official website](https://docs.docker.com/get-docker/).

`docker-compose` orchestrates all containers so they can communicate on the same internal network. Instead of installing each service (Postgres, Redis, MinIO, etc.) locally, you can spin up the entire infrastructure with a single command:

```bash
docker-compose up -d
```

<details>
<summary><strong>View docker-compose.yml</strong></summary>

```yaml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.13.0
    volumes:
      - esdata01:/usr/share/elasticsearch/data
    ports:
      - 9200:9200
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false

  minio:
    image: minio/minio
    container_name: minio
    ports:
      - "9000:9000"   # Storage API
      - "9001:9001"   # Web Console
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

  postgres_db:
    container_name: postgres
    image: pgvector/pgvector:pg18
    environment:
      POSTGRES_USER: ${POSTGRES_DB_USER}
      POSTGRES_PASSWORD: ${POSTGRES_DB_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB_NAME}
      PGDATA: /var/lib/postgresql/data
    volumes:
      - db:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - db
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_DB_USER} -d ${POSTGRES_DB_NAME}"]
      interval: 30s
      timeout: 10s
      retries: 5

  stripe-cli:
    image: stripe/stripe-cli
    command: listen --forward-to http://host.docker.internal:8000/webhook/
    environment:
      - STRIPE_API_KEY=${STRIPE_SECRET_KEY}

  redis:
    image: redis:latest
    container_name: redis-cache
    ports:
      - '6379:6379'
    volumes:
      - redis-data:/data
    environment:
      - REDIS_ARGS=--requirepass your_password_here --appendonly yes
    restart: unless-stopped

networks:
  db:
    driver: bridge

volumes:
  db:
  minio_data:
  esdata01:
  redis-data:
```

</details>

---

## 2. ElasticSearch (Text Search)

ElasticSearch is a highly scalable, open-source full-text search and analytics engine. In an e-commerce context, relying on SQL `LIKE` queries for product searches is slow and inflexible — ElasticSearch powers the search bar with fuzzy matching, relevance scoring, and near-instant lookups.

### Installation

Install the [`django-elasticsearch-dsl`](https://django-elasticsearch-dsl.readthedocs.io/en/latest/quickstart.html#quickstart) package:

```bash
pip install django-elasticsearch-dsl
```

### Configuration

Add the connection settings to `settings.py`:

```python
ELASTICSEARCH_DSL = {
    'default': {
        'hosts': 'http://localhost:9200',
        'http_auth': ('username', 'password')
    }
}
```

### Creating a Document

A **Document** is the bridge between your Django model and an ElasticSearch index. It defines which model fields get indexed and how the index itself is configured. Create a `documents.py` file (I placed mine next to `settings.py`):

```python
from django_elasticsearch_dsl import Document
from django_elasticsearch_dsl.registries import registry
from inventory.models import Product

@registry.register_document
class ProductDocument(Document):
    class Index:
        name = 'products'
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0
        }

    class Django:
        model = Product
        fields = ['product_name', 'category']
```

The `@registry.register_document` decorator automatically keeps the index in sync with your database whenever a `Product` is saved or deleted. The `Index` class configures the underlying ElasticSearch index, and the `Django` class tells the document which model and fields to map.

Once ElasticSearch is running in Docker, build and populate the index:

```bash
python manage.py search_index --create
python manage.py search_index --populate
```

### Search View

The following view uses a [`MultiMatch`](https://elasticsearch-dsl.readthedocs.io/en/latest/search_dsl.html#the-search-object) query across multiple fields with `fuzziness='AUTO'`, so it gracefully handles typos:

```python
from elasticsearch_dsl import Q
from ecommerce.documents import ProductDocument

@api_view(['GET'])
def SearchView(request, text):
    search = ProductDocument.search()

    query = Q(
        'multi_match',
        query=text,
        fields=["product_name", "category"],
        fuzziness='AUTO',
        type='best_fields',
    )

    search = search.query(query)
    queryset = search.to_queryset()
    serializer = ProductSerializer(queryset, many=True)

    return Response(data=serializer.data, status=HTTP_200_OK)
```

### Understanding the Elasticsearch Package Layers

The Elasticsearch Python ecosystem has three distinct layers that can be confusing at first. Here's how they fit together:

| Layer | Package | Role | Read the docs? |
|---|---|---|---|
| **Bottom** | `elasticsearch` | The raw network client. Sends JSON directly to the server. You'd have to hand-write massive JSON dictionaries to do anything useful. | Almost never |
| **Middle** | `elasticsearch-dsl` | Gives you Pythonic `Search()`, `filter()`, and `Q()` objects that compile down to that raw JSON for you. | **Yes** — whenever you search or filter data. [Docs ↗](https://elasticsearch-dsl.readthedocs.io/) |
| **Top** | `django-elasticsearch-dsl` | The Django bridge. Watches your models via signals, syncs saves/deletes to the index, and converts results back to QuerySets via `.to_queryset()`. | **Yes, but only once** — to write `documents.py` and learn the `manage.py` commands. [Docs ↗](https://django-elasticsearch-dsl.readthedocs.io/) |

### Rule of Thumb

> **Setting up or syncing data?** (writing `documents.py`, mapping fields, running `manage.py search_index`) → **`django-elasticsearch-dsl` docs**
>
> **Querying data?** (full-text search, filters, fuzzy matching, AND/OR logic) → **`elasticsearch-dsl` docs**


---

## 3. MinIO (Object Storage)

MinIO is a high-performance, S3-compatible open-source object storage server. Instead of cluttering the Django server with media files, product images are uploaded to MinIO, and the frontend fetches them directly via URL.

### How It Works

Django's default storage saves files to the local filesystem. The goal here is to redirect that to MinIO. Since MinIO speaks the S3 protocol, we use `django-storages` with `boto3` (Amazon's S3 client library) as the translator — Django talks to `django-storages`, which talks to `boto3`, which talks to MinIO over the S3 API.

### Installation

```bash
pip install django-storages boto3
```

### Configuration

Register `storages` in your installed apps:

```python
INSTALLED_APPS = [
    # ...
    'storages',
]
```

Then add the MinIO connection parameters to `settings.py`:

> **Note on ports:** MinIO exposes two ports. Port `9000` is the S3-compatible storage API (what Django connects to). Port `9001` is the web-based admin console for managing buckets and policies.
>
> **Note on `AWS_S3_ENDPOINT_URL`:** In local development this should be `http://127.0.0.1:9000`. In production, point this to your actual domain serving MinIO over HTTPS.

```python
# ============================== MINIO STORAGE ==================================

# 1. Credentials
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')

# 2. The Bucket — create this in the MinIO console beforehand
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')

# 3. Endpoint — overrides the default AWS URL and points boto3 at your MinIO instance
AWS_S3_ENDPOINT_URL = os.environ.get('AWS_S3_ENDPOINT_URL')  # e.g. http://127.0.0.1:9000

# 4. SSL — set False for local HTTP development; True in production with HTTPS
AWS_S3_USE_SSL = False

# 5. Don't add authentication query params to every image URL
#    (Safe to disable when your bucket policy is set to public read)
AWS_QUERYSTRING_AUTH = False

# 6. Prevent files with the same name from overwriting each other
AWS_S3_FILE_OVERWRITE = False

# 7. Build the custom domain so generated URLs point at MinIO, not AWS
#    Results in something like: 127.0.0.1:9000/products
AWS_S3_CUSTOM_DOMAIN = f"{AWS_S3_ENDPOINT_URL.split('//')[1]}/{AWS_STORAGE_BUCKET_NAME}"

# 8. Ensure generated URLs use http in local dev
AWS_S3_URL_PROTOCOL = 'http:'

# 9. Route Django's default file storage through S3/MinIO
STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}
```

At this point, whenever a `Product` with an `ImageField` is saved, Django intercepts the file, hands it to `boto3`, which fires an HTTP `PUT` request directly to your MinIO container.

### Fixing the `AccessDenied` Error (Public Bucket Policy)

> **Common Gotcha:** MinIO buckets are **private by default**. After uploading images, the frontend will get an `AccessDenied` error when trying to load them via URL.

The fix is to apply a public download policy to the bucket using the MinIO Client (`mc`). Since `mc` isn't bundled in the MinIO server container, spin up a temporary `minio/mc` container on the same Docker network:

**Step 1:** Find your MinIO container's internal Docker network name and IP:
```bash
docker inspect minio | grep -E '"Networks"|"IPAddress"'
```

**Step 2:** Run a temporary `mc` container on that network and apply the policy in one chained command:
```bash
docker run --rm -it \
  --network ecommerce_backend_default \
  --entrypoint /bin/sh \
  minio/mc \
  -c "mc alias set local http://<MINIO_INTERNAL_IP>:9000 minioadmin minioadmin && mc anonymous set download local/products"
```

Replace `<MINIO_INTERNAL_IP>` with the IP from Step 1 (e.g. `172.18.0.2`). The `--entrypoint /bin/sh` flag overrides the default entrypoint so we can run a shell, and the `&&` ensures the alias is registered before the policy command fires. The `--rm` flag destroys the container once the command completes.

After this, your `products` bucket will accept anonymous `GET` requests and images will load normally.

---

## 4. PostgreSQL & PGVector (Database & Recommendations)

PostgreSQL handles all standard relational data (users, orders, products). On top of that, the **PGVector** extension enables vector similarity search, which powers the product recommendation system.

### Django Configuration

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.environ.get('POSTGRES_DB_NAME'),
        'USER': os.environ.get('POSTGRES_DB_USER'),
        'PASSWORD': os.environ.get('POSTGRES_DB_PASSWORD'),
        'HOST': os.environ.get('POSTGRES_DB_HOST'),
        'PORT': os.environ.get('POSTGRES_DB_PORT'),
    }
}
```

Make sure the corresponding environment variables are set in your `docker-compose.yml`:

```yaml
environment:
  POSTGRES_USER: ${POSTGRES_DB_USER}
  POSTGRES_PASSWORD: ${POSTGRES_DB_PASSWORD}
  POSTGRES_DB: ${POSTGRES_DB_NAME}
  PGDATA: /var/lib/postgresql/data
```

### Vector Search for Recommendations

Product descriptions are converted into numerical **vector embeddings** (arrays of 384 floats). PGVector stores these embeddings directly in the database and can run a **cosine similarity** query to find products that are mathematically close to a given product — i.e., semantically similar.

The `Product` model includes a `VectorField` alongside its standard fields:

```python
from pgvector.django import VectorField

class Product(models.Model):
    id                  = models.UUIDField(primary_key=True)
    product_name        = models.CharField(max_length=100)
    product_price       = models.DecimalField(max_digits=7, decimal_places=2)
    product_description = models.TextField()
    embedding           = VectorField(dimensions=384, null=True, blank=True)

    class Categories(models.TextChoices):
        ELECTRONICS = "ELECTRONICS", "Electronics"
        ACCESSORIES = "ACCESSORIES", "Accessories"
        BAGS        = "BAGS", "Bags"
        HOME_LIVING = "HOME_LIVING", "Home & Living"

    category = models.CharField(max_length=11, choices=Categories.choices, null=True, blank=True)
```

The recommendation view annotates the queryset with a cosine distance score and returns the 5 closest products:

```python
from pgvector.django import CosineDistance

@api_view(['GET'])
def getSuggestedItems(request, productID):
    try:
        targetProduct = Product.objects.get(id=productID)
    except Product.DoesNotExist:
        return Response({'msg': 'Invalid ID'}, status=HTTP_400_BAD_REQUEST)

    related_products = (
        Product.objects
        .annotate(distance=CosineDistance('embedding', targetProduct.embedding))
        .order_by('distance')[:5]
    )

    return Response(
        data={'suggested_products': ProductSerializer(related_products, many=True).data},
        status=HTTP_200_OK
    )
```

> **Note:** The recommendation system is functional but the embedding generation pipeline is still being refined. The view above demonstrates the intended query pattern.

---

## 5. Stripe (Payment Integration)

Stripe handles the full checkout flow. There are two key pieces: a **checkout session endpoint** that initiates the payment, and a **webhook** that Stripe calls after a payment completes.

### Installation

```bash
pip install stripe
```

### Configuration

```python
# settings.py
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY')
STRIPE_SECRET_KEY      = os.environ.get('STRIPE_SECRET_KEY')
STRIPE_CURRENCY        = os.environ.get('STRIPE_CURRENCY')
STRIPE_WEBHOOK_SECRET  = os.environ.get('STRIPE_WEBHOOK_SECRET')
```

### How It Works

**`stripeCheckoutCreationView` (POST `/checkout/`):**  
The frontend calls this endpoint to start a checkout. It reads the user's cart from the database, builds a Stripe `line_items` list, and creates a hosted Checkout Session. Stripe returns a `url` — the frontend redirects the user there to enter their payment details on Stripe's secure page.

**`stripeWebhookView` (POST `/webhook/`):**  
After payment completes, Stripe sends a signed `POST` request to this endpoint. The signature is verified against `STRIPE_WEBHOOK_SECRET` to prevent forgery. On a `checkout.session.completed` event, the handler creates an `Order` record, populates `OrderItem` rows, and clears the user's cart — all in a single atomic transaction.

```python
import stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

@api_view(['POST'])
def stripeCheckoutCreationView(request):
    cart = Cart.objects.get(user=request.user.id)
    cartItems = cart.items.all()

    product_ids = [str(item.product.id) for item in cartItems]
    products_by_id = {str(p.id): p for p in Product.objects.filter(id__in=product_ids)}

    line_items = []
    for item in cartItems:
        product = products_by_id[str(item.product.id)]
        line_items.append({
            "price_data": {
                "currency": settings.STRIPE_CURRENCY,
                "unit_amount": int(product.product_price * 100),
                "product_data": {"name": product.product_name},
            },
            "quantity": item.quantity,
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

    return Response(data={'url': session.url}, status=status.HTTP_200_OK)


@csrf_exempt
def stripeWebhookView(request):
    payload    = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        return HttpResponse(status=400)

    if event["type"] == "checkout.session.completed":
        handle_successful_payment(event["data"]["object"])

    return HttpResponse(status=200)


def handle_successful_payment(session):
    if session.payment_status != "paid":
        return

    try:
        user       = User.objects.get(id=session.metadata["user_id"])
        cart_items = CartItem.objects.filter(cart=user.cart.id)
    except (User.DoesNotExist, CartItem.DoesNotExist):
        return

    with transaction.atomic():
        order = Order.objects.create(
            user=user,
            total_price=session.amount_total / 100,
            stripe_session_id=session.id,
            status="Delivered",
        )
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
            )
        cart_items.delete()
```

> **Local Testing:** The `stripe-cli` service in `docker-compose.yml` forwards Stripe webhook events to your local server, so you can test the full payment flow without deploying.

---

## 6. Caching (Redis)

Caching is essential in an e-commerce backend. Product lists are read far more often than they are written — without caching, every visit to the catalogue hits the database. Redis stores the serialized response in memory so subsequent requests are served in microseconds.

### Installation

```bash
pip install django-redis
```

### Configuration

```python
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}
```

### Usage

Apply `@cache_page` to list views to cache the full response. The `key_prefix` is used during invalidation:

```python
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    @method_decorator(cache_page(60 * 60 * 2, key_prefix='product_list'))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
```

### Cache Invalidation via Django Signals

Stale cache is a common problem. Django Signals let us hook into model save/delete events and automatically bust the cache — no manual cache management needed. The `delete_pattern` method (provided by `django-redis`) wipes every cache key matching the prefix:

```python
from django.core.cache import cache
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

@receiver([post_save, post_delete], sender=Product)
def invalidate_product_cache(sender, instance, **kwargs):
    cache.delete_pattern('*product_list*')
```

---

## 7. Rate Limiting (Custom Middleware)

To protect the API from abuse and brute-force attacks, I implemented a custom rate-limiting middleware backed by Redis — rather than reaching for a package. This was a deliberate choice to understand how Django middleware intercepts the request/response cycle and how Redis atomic operations work.

### How It Works

Every incoming request is identified either by its **JWT user ID** (for authenticated users) or **IP address** (for anonymous users). A Redis key is incremented atomically on each request. If the count exceeds the limit within the time window, a `429 Too Many Requests` response is returned immediately, before the view is ever called.

Using `INCR` + `EXPIRE` is an atomic, lock-free pattern — two requests arriving simultaneously will never produce a race condition.

```python
import jwt
import redis
from django.conf import settings
from django.http import JsonResponse

redis_client = redis.StrictRedis(
    host=getattr(settings, 'REDIS_HOST', 'localhost'),
    port=getattr(settings, 'REDIS_PORT', 6379),
    db=0,
    decode_responses=True
)

class RateLimitingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.rate_limit  = 100  # Max requests per window
        self.time_window = 60   # Window size in seconds

    def __call__(self, request):
        client_ip = self.get_client_ip(request)
        user_id   = self.get_user_id_from_jwt(request)

        identifier = f"user:{user_id}" if user_id else f"ip:{client_ip}"
        redis_key  = f"rate_limit:{identifier}"

        try:
            request_count = redis_client.incr(redis_key)
            if request_count == 1:
                redis_client.expire(redis_key, self.time_window)

            if request_count > self.rate_limit:
                return JsonResponse(
                    {"error": "Too Many Requests", "detail": "Rate limit exceeded. Please try again later."},
                    status=429
                )
        except redis.RedisError:
            # Fail open — if Redis is down, don't block legitimate traffic.
            # Log this in production.
            pass

        return self.get_response(request)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')

    def get_user_id_from_jwt(self, request):
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                return payload.get('user_id')
            except (jwt.ExpiredSignatureError, jwt.DecodeError):
                return None
        return None
```

### Registration

Add the middleware to `settings.py`. It should be placed early in the stack so rate-limited requests are rejected before hitting any view logic:

```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'users.middlewares.rateLimiting.RateLimitingMiddleware',  # 👈
]
```

---

## 8. API Documentation (Swagger / drf-yasg)

`drf-yasg` automatically generates interactive API documentation by introspecting your DRF serializers, views, and URL patterns — no manual spec writing required.

### Installation

```bash
pip install drf-yasg
```

### Configuration

```python
# urls.py
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="E-Commerce API",
        default_version='v1',
        description="API documentation for the Django e-commerce backend.",
        contact=openapi.Contact(email="your@email.com"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    # ... other urls
]
```

Once the server is running, visit:
- **`/swagger/`** — Interactive Swagger UI (try requests directly in the browser)
- **`/redoc/`** — Clean ReDoc documentation view

---

## Next Steps / Application Architecture