# accounts/urls.py
from django.urls import path
from .views import CustomTokenObtainPairView, UserRegistrationView, GoogleLoginView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('google/', GoogleLoginView.as_view(), name='google_login'),
]