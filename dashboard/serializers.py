from rest_framework import serializers
from products.models import OrderItem, Product, Order, Review, Banner, Coupon
from .models import SiteCMS, SiteSettings
from django.contrib.auth import get_user_model

User = get_user_model()

class RedactedOrderSerializer(serializers.ModelSerializer):
    shipping_address = serializers.CharField(source='order.shipping_address')
    order_date = serializers.DateTimeField(source='order.created_at')
    product_name = serializers.CharField(source='product.title', default='Unlisted Item')
    order_status = serializers.CharField(source='order.order_status')

    class Meta:
        model = OrderItem
        fields = [
            'id', 'order_date', 'product_name', 'quantity', 
            'price_at_purchase', 'shipping_address', 'order_status',
            'item_status', 'tracking_number'
        ]

class LowStockAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'title', 'sku', 'stock_quantity']

class AdminSellerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'status', 'created_at']

class AdminReviewSerializer(serializers.ModelSerializer):
    product_title = serializers.CharField(source='product.title', read_only=True)
    purchaser_email = serializers.CharField(source='purchaser.email', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'product_title', 'purchaser_email', 'rating', 'comment', 'is_approved', 'created_at']

class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ['id', 'title', 'subtitle', 'badge', 'cta_text', 'image_url', 'is_active', 'created_at']

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'discount_percent', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

class SiteCMSSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteCMS
        fields = ['id', 'homepage_sections', 'hero_slides', 'announcement_bar', 'brand_story', 'faq_items', 'featured_categories', 'featured_products', 'footer_content', 'updated_at']


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            'id', 'store_name', 'support_email', 'support_phone', 'store_address', 
            'currency', 'free_shipping_threshold', 'flat_shipping_rate', 
            'cod_enabled', 'maintenance_mode', 'shipper_name', 'shipper_address', 
            'shipper_phone', 'shipper_email', 'return_policy_note', 'updated_at'
        ]

class AdminOrderItemSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='product.title', default='Product Item')
    price = serializers.DecimalField(source='price_at_purchase', max_digits=10, decimal_places=2)
    qty = serializers.IntegerField(source='quantity')

    class Meta:
        model = OrderItem
        fields = ['id', 'name', 'price', 'qty']

class AdminOrderSerializer(serializers.ModelSerializer):
    customer = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    date = serializers.DateTimeField(source='created_at', read_only=True)
    formattedDate = serializers.SerializerMethodField()
    formattedTime = serializers.SerializerMethodField()
    status = serializers.CharField(source='order_status')
    paymentMethod = serializers.CharField(source='payment_gateway_ref', default='Cash on Delivery')
    shippingAddress = serializers.CharField(source='shipping_address', read_only=True)
    billingAddress = serializers.CharField(source='billing_address', read_only=True)
    total = serializers.DecimalField(source='total_amount', max_digits=10, decimal_places=2)
    items = AdminOrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'email', 'phone', 'date', 'formattedDate', 'formattedTime', 
            'status', 'paymentMethod', 'shippingAddress', 'billingAddress', 'total', 'items'
        ]

    def get_customer(self, obj):
        if obj.purchaser:
            name = f"{obj.purchaser.first_name} {obj.purchaser.last_name}".strip()
            return name if name else obj.purchaser.email
        return 'Valued Customer'

    def get_email(self, obj):
        return obj.purchaser.email if obj.purchaser else ''

    def get_phone(self, obj):
        if getattr(obj, 'customer_phone', None):
            return obj.customer_phone
        return 'N/A'

    def get_formattedDate(self, obj):
        return obj.created_at.strftime('%b %d, %Y') if obj.created_at else ''

    def get_formattedTime(self, obj):
        return obj.created_at.strftime('%I:%M %p') if obj.created_at else ''

from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)
    formattedTime = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ['id', 'user_email', 'user_role', 'action', 'details', 'module', 'ip_address', 'timestamp', 'formattedTime']

    def get_formattedTime(self, obj):
        return obj.created_at.strftime('%b %d, %Y at %I:%M %p') if obj.created_at else ''