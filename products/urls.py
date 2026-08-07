from django.urls import path
from .views import (
    ProductListView, ProductDetailView, CheckoutView, StripeWebhookView,
    SellerProductListCreateView, SellerProductDetailView,
    ProductImageUploadView, SellerOrderListView, 
    SellerAnalyticsView, SellerActivityView, ReviewListCreateAPIView,
    PublicBannerListView, ValidateCouponView, CategoryListCreateView, CategoryDetailView,
    ClaimOrderView
)

urlpatterns = [
    # Public Routes
    path('catalog/', ProductListView.as_view(), name='product-catalog'),
    path('catalog/<str:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('orders/<str:pk>/claim/', ClaimOrderView.as_view(), name='claim-guest-order'),
    path('categories/', CategoryListCreateView.as_view(), name='category-list'),
    path('categories/<str:pk>/', CategoryDetailView.as_view(), name='category-detail'),
    path('reviews/', ReviewListCreateAPIView.as_view(), name='create-review'),
    path('banners/', PublicBannerListView.as_view(), name='public-banners'),
    path('coupons/validate/', ValidateCouponView.as_view(), name='validate-coupon'),
    
    # Financial Webhooks
    path('webhooks/stripe/', StripeWebhookView.as_view(), name='stripe-webhook'),
    
    # Seller Dashboard Routes
    path('dashboard/products/', SellerProductListCreateView.as_view(), name='seller-products'),
    path('dashboard/products/<str:pk>/', SellerProductDetailView.as_view(), name='seller-product-detail'),
    path('dashboard/products/<str:pk>/upload-image/', ProductImageUploadView.as_view(), name='seller-image-upload'),
    path('dashboard/orders/', SellerOrderListView.as_view(), name='seller-orders'),
    path('dashboard/analytics/', SellerAnalyticsView.as_view(), name='seller-analytics'),
    path('dashboard/activity/', SellerActivityView.as_view(), name='seller-activity'),
]