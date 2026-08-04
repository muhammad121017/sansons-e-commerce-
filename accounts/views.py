import logging
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer, UserRegistrationSerializer
from django.contrib.auth import get_user_model

User = get_user_model()
audit_logger = logging.getLogger('audit_logger')

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_brute_force'
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            email = request.data.get('email', '').strip()
            user = User.objects.filter(email__iexact=email).first()
            if user:
                response.data['user'] = {
                    'id': str(user.id),
                    'email': user.email,
                    'role': user.role,
                    'status': user.status,
                    'allowed_modules': user.allowed_modules or [],
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            audit_logger.info(f"User Login: {email} authenticated successfully.")
        return response

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth_brute_force'

    def perform_create(self, serializer):
        user = serializer.save()
        audit_logger.info(f"Account Registration: New {user.role} created with email {user.email}.")

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        google_id = request.data.get('google_id', '')

        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        user, created = User.objects.get_or_create(
            email__iexact=email,
            defaults={
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
                'role': 'purchaser',
                'status': 'active',
                'is_staff': False
            }
        )

        if created:
            import uuid
            user.set_password(str(uuid.uuid4()))
            user.save()
            audit_logger.info(f"Google OAuth Registration: New user {email} created.")
        else:
            audit_logger.info(f"Google OAuth Login: User {email} logged in.")

        refresh = RefreshToken.for_user(user)
        refresh['email'] = user.email
        refresh['role'] = user.role
        refresh['allowed_modules'] = user.allowed_modules or []

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': str(user.id),
                'email': user.email,
                'role': user.role,
                'status': user.status,
                'allowed_modules': user.allowed_modules or [],
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        }, status=status.HTTP_200_OK)