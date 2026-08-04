from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Interactive API Documentation Schema Configuration
schema_view = get_schema_view(
    openapi.Info(
        title="SanSons API",
        default_version='v1',
        description="Official API Documentation for the SanSons Multi-Tenant E-Commerce Engine.",
        contact=openapi.Contact(email="admin@sansons.local"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/products/', include('products.urls')), 
    
    # ADDED: Phase 6 Dashboard Routing
    path('api/dashboard/', include('dashboard.urls')), 
    
    # Swagger & ReDoc Documentation Routes
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]