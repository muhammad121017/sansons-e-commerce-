from django.urls import path
from .views import (
    VendorDashboardOverviewView, VendorRedactedOrdersView,
    AdminSellerListView, AdminVerifySellerView,
    AdminReviewListView, AdminApproveReviewView,
    AdminProductListView, AdminToggleDealView,
    AdminPlatformOverviewView, VendorUpdateFulfillmentStatusView,
    AdminBannerListCreateView, VendorCouponListCreateView,
    VendorCouponDetailView, AdminUserManagementView, AdminUserDetailView,
    SiteCMSView, SiteSettingsView, AdminOrderListView, AdminOrderDetailView,
    AdminTogglePublishView, AdminAuditLogView,
    VisitorActivityRecordView, AdminVisitorActivityLogsView
)

urlpatterns = [
    path('overview/', VendorDashboardOverviewView.as_view(), name='dashboard-overview'),
    path('orders/', VendorRedactedOrdersView.as_view(), name='dashboard-orders'),
    path('orders/<str:pk>/fulfill/', VendorUpdateFulfillmentStatusView.as_view(), name='vendor-fulfill-order'),
    path('coupons/', VendorCouponListCreateView.as_view(), name='vendor-coupons'),
    path('coupons/<str:pk>/', VendorCouponDetailView.as_view(), name='vendor-coupon-detail'),
    
    # CMS & Settings Routes
    path('cms/', SiteCMSView.as_view(), name='site-cms'),
    path('settings/', SiteSettingsView.as_view(), name='site-settings'),
    
    # Admin Moderation & Executive Financial Routes
    path('admin/financials/', AdminPlatformOverviewView.as_view(), name='admin-financials'),
    path('admin/all-orders/', AdminOrderListView.as_view(), name='admin-all-orders'),
    path('admin/orders/<str:pk>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
    path('admin/sellers/', AdminSellerListView.as_view(), name='admin-sellers'),
    path('admin/sellers/<str:pk>/verify/', AdminVerifySellerView.as_view(), name='admin-verify-seller'),
    path('admin/reviews/', AdminReviewListView.as_view(), name='admin-reviews'),
    path('admin/reviews/<str:pk>/moderate/', AdminApproveReviewView.as_view(), name='admin-moderate-review'),
    path('admin/products/', AdminProductListView.as_view(), name='admin-products'),
    path('admin/products/<str:pk>/deal/', AdminToggleDealView.as_view(), name='admin-toggle-deal'),
    path('admin/products/<str:pk>/toggle-publish/', AdminTogglePublishView.as_view(), name='admin-toggle-publish'),
    path('admin/banners/', AdminBannerListCreateView.as_view(), name='admin-banners'),
    path('admin/users/', AdminUserManagementView.as_view(), name='admin-users'),
    path('admin/users/<str:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/audit-logs/', AdminAuditLogView.as_view(), name='admin-audit-logs'),
    
    # Store Traffic & Visitor Tracking Routes
    path('visitor-activity/record/', VisitorActivityRecordView.as_view(), name='visitor-activity-record'),
    path('admin/visitor-activity/logs/', AdminVisitorActivityLogsView.as_view(), name='admin-visitor-activity-logs'),
]


