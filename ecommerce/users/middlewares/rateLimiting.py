import jwt
import redis
from django.conf import settings
from django.http import JsonResponse

# Initialize Redis client
redis_client = redis.StrictRedis(
    host=getattr(settings, 'REDIS_HOST', 'localhost'),
    port=getattr(settings, 'REDIS_PORT', 6379),
    db=0,
    decode_responses=True
)

class RateLimitingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        # Configure limits 
        self.rate_limit = 100 
        self.time_window = 60 

    def __call__(self, request):
        # 1. Identify the client
        client_ip = self.get_client_ip(request)
        user_id = self.get_user_id_from_jwt(request)

        # 2. Determine the Redis key (prioritize user ID, fallback to IP)
        identifier = f"user:{user_id}" if user_id else f"ip:{client_ip}"
        redis_key = f"rate_limit:{identifier}"

        # 3. Redis Rate Limiting Logic
        try:
            # Atomic increment
            request_count = redis_client.incr(redis_key)

            # If it's the first request in the window, set the TTL (expiration)
            if request_count == 1:
                redis_client.expire(redis_key, self.time_window)

            # Check if limit is exceeded
            if request_count > self.rate_limit:
                return JsonResponse(
                    {"error": "Too Many Requests", "detail": "Rate limit exceeded. Please try again later."},
                    status=429
                )
        except redis.RedisError:
            # If Redis goes down, it's best to fail open so your app doesn't crash.
            # You might want to log this error in a production environment.
            pass

        # 4. Proceed with the request
        response = self.get_response(request)
        return response

    def get_client_ip(self, request):
        """Extract the real IP address, accounting for proxies."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')

    def get_user_id_from_jwt(self, request):
        """Manually decode the JWT to get the user ID before the view layer."""
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                # If using SimpleJWT, the default user payload claim is 'user_id'
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                return payload.get('user_id') 
            except (jwt.ExpiredSignatureError, jwt.DecodeError):
                # If the token is invalid or expired, ignore it and let DRF handle the 401 later.
                # We'll just rate limit them by IP for now.
                return None
        return None