from rest_framework import serializers
from django.utils.html import escape
from .models import Product, Category, Order, OrderItem, Review, ProductImage

class CategorySerializer(serializers.ModelSerializer):
    count = serializers.IntegerField(read_only=True, default=0)
    visibility_status = serializers.SerializerMethodField()
    approval_status = serializers.CharField(source='status', read_only=True)
    requested_by_email = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image', 'description', 'count', 'status', 'approval_status', 'visibility_status', 'requested_by', 'requested_by_email', 'rejection_reason']

    def get_visibility_status(self, obj):
        return 'active' if obj.deleted_at is None else 'hidden'

    def get_requested_by_email(self, obj):
        return obj.requested_by.email if obj.requested_by else None


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'description', 'price', 'compare_at_price',
            'stock_quantity', 'images', 'attributes', 
            'category', 'seller', 'is_published', 'is_deal_of_the_week'
        ]

class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    reviews = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'description', 'price', 'compare_at_price',
            'stock_quantity', 'images', 'attributes', 
            'category', 'seller', 'is_published', 'is_deal_of_the_week', 'reviews'
        ]

    def get_reviews(self, obj):
        approved_reviews = obj.reviews.filter(is_approved=True)
        return ReviewSerializer(approved_reviews, many=True).data

# --- Checkout Serializers ---

class CartItemSerializer(serializers.Serializer):
    product_id = serializers.CharField() # UUID format string
    quantity = serializers.IntegerField(min_value=1)

class CheckoutSerializer(serializers.Serializer):
    items = CartItemSerializer(many=True)
    shipping_address = serializers.CharField(max_length=255)
    billing_address = serializers.CharField(max_length=255)
    payment_method = serializers.CharField(max_length=20, required=False, default='stripe')

# --- Seller Dashboard Serializers ---

class SellerProductSerializer(serializers.ModelSerializer):
    low_stock_alert = serializers.SerializerMethodField()
    category = serializers.SlugRelatedField(
        slug_field='slug',
        queryset=Category.objects.all()
    )

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'sku', 'slug', 'description', 'price', 'compare_at_price',
            'stock_quantity', 'images', 'attributes', 
            'category', 'is_published', 'is_deal_of_the_week', 'low_stock_alert'
        ]
        extra_kwargs = {
            'sku': {'required': False, 'allow_blank': True},
            'slug': {'required': False, 'allow_blank': True}
        }

    def get_low_stock_alert(self, obj):
        return obj.stock_quantity < 10

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'product', 'original_file', 'is_processed', 'created_at']
        read_only_fields = ['is_processed', 'product']

class SellerOrderItemSerializer(serializers.ModelSerializer):
    shipping_address = serializers.CharField(source='order.shipping_address')
    order_status = serializers.CharField(source='order.order_status')
    order_date = serializers.DateTimeField(source='order.created_at')
    product_title = serializers.CharField(source='product.title')

    class Meta:
        model = OrderItem
        fields = [
            'id', 'order_date', 'product_title', 'quantity', 
            'price_at_purchase', 'shipping_address', 'order_status'
        ]

# --- Review Submission Serializer ---

class ReviewSerializer(serializers.ModelSerializer):
    rating = serializers.IntegerField(min_value=1, max_value=5, default=5)
    comment = serializers.CharField(max_length=2000, required=False, allow_blank=True)
    author_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    images = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    purchaser_email = serializers.SerializerMethodField(read_only=True)
    purchaser_name = serializers.SerializerMethodField(read_only=True)
    date = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'product', 'rating', 'comment', 'author_name', 'images', 'is_approved', 'purchaser_email', 'purchaser_name', 'date', 'created_at']
        read_only_fields = ['is_approved', 'created_at']

    def get_purchaser_email(self, obj):
        return obj.purchaser.email if obj.purchaser else ''

    def get_purchaser_name(self, obj):
        if obj.author_name:
            return obj.author_name
        if obj.purchaser:
            name = f"{obj.purchaser.first_name} {obj.purchaser.last_name}".strip()
            return name if name else obj.purchaser.email
        return 'Verified Customer'

    def validate_comment(self, value):
        if value:
            return escape(value)
        return value