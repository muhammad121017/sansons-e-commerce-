import uuid
from django.db import models
from django.conf import settings
from django.contrib.postgres.indexes import GinIndex
from django.utils import timezone
from django.utils.text import slugify

# ---------------------------------------------------------
# CATEGORY & PRODUCT MODELS
# ---------------------------------------------------------

class Category(models.Model):
    STATUS_CHOICES = (
        ('approved', 'Approved'),
        ('pending', 'Pending Approval'),
        ('rejected', 'Rejected'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    image = models.URLField(max_length=500, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='approved')
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='requested_categories')
    rejection_reason = models.TextField(null=True, blank=True)

    # Soft Deletion implementation
    deleted_at = models.DateTimeField(null=True, blank=True)

    def delete(self, *args, **kwargs):
        self.deleted_at = timezone.now()
        self.save()

    def __str__(self):
        return self.name


class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, limit_choices_to={'role': 'seller'})
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    
    price = models.DecimalField(max_digits=10, decimal_places=2)
    compare_at_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    sku = models.CharField(max_length=100, unique=True)
    stock_quantity = models.IntegerField(default=0)
    
    images = models.JSONField(default=list)  
    attributes = models.JSONField(null=True, blank=True) 
    is_published = models.BooleanField(default=False)
    is_deal_of_the_week = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Soft Deletion implementation
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        # JSONB Queries: Implements GinIndex for hyper-fast attribute filtering
        indexes = [
            GinIndex(fields=['attributes'], name='product_attr_gin_idx'),
        ]

    def delete(self, *args, **kwargs):
        self.deleted_at = timezone.now()
        self.is_published = False
        self.save()

    def save(self, *args, **kwargs):
        if not self.sku:
            # Auto-generate SKU based on product title
            base_sku = slugify(self.title)[:20].upper()
            if not base_sku:
                base_sku = "PROD"
            self.sku = f"{base_sku}-{str(uuid.uuid4())[:8].upper()}"
        else:
            self.sku = self.sku.upper()
        
        # Prevent unique SKU constraint crash by automatically appending suffix if duplicate
        original_sku = self.sku
        counter = 1
        while Product.objects.filter(sku=self.sku).exclude(id=self.id).exists():
            self.sku = f"{original_sku[:90]}-{counter}"
            counter += 1

        if not self.slug:
            # Auto-generate unique slug based on product title
            base_slug = slugify(self.title)
            if not base_slug:
                base_slug = "product"
            self.slug = base_slug
            slug_counter = 1
            while Product.objects.filter(slug=self.slug).exclude(id=self.id).exists():
                self.slug = f"{base_slug[:40]}-{slug_counter}"
                slug_counter += 1
            
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

# ---------------------------------------------------------
# RAW IMAGE HANDLING & STORAGE BUCKETS
# ---------------------------------------------------------

def seller_directory_path(instance, filename):
    return f'sellers/{instance.product.seller.id}/products/{instance.product.id}/{filename}'

class ProductImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='raw_images')
    original_file = models.ImageField(upload_to=seller_directory_path)
    is_processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Raw Image for {self.product.title}"

# ---------------------------------------------------------
# ORDER MODELS (Parent and Child)
# ---------------------------------------------------------

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )
    PAYMENT_STATUS = (
        ('unpaid', 'Unpaid'),
        ('authorized', 'Authorized'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    purchaser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'purchaser'}
    )
    is_guest = models.BooleanField(default=False)
    
    # Idempotency Key Shield: Prevents duplicate orders
    idempotency_key = models.CharField(max_length=255, unique=True, null=True, blank=True)
    
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    order_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='unpaid')
    payment_gateway_ref = models.CharField(max_length=255, null=True, blank=True)
    
    # Static string snapshots required by the architectural spec
    shipping_address = models.TextField()  
    billing_address = models.TextField()   
    customer_phone = models.CharField(max_length=50, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"Order {self.id} - {self.purchaser or 'Guest'}"

class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, limit_choices_to={'role': 'seller'})
    
    quantity = models.PositiveIntegerField()
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2) # Critical Snapshot
    
    # Platform Commission Split Engine: Locks in the exact fee calculation at checkout
    platform_commission = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Fulfillment tracking
    tracking_number = models.CharField(max_length=100, null=True, blank=True)
    item_status = models.CharField(max_length=20, default='pending')

    def __str__(self):
        return f"{self.quantity} x {self.product} (Order: {self.order.id})"

# ---------------------------------------------------------
# REVIEWS MODEL
# ---------------------------------------------------------

class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    purchaser = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    rating = models.PositiveSmallIntegerField() 
    comment = models.TextField()
    is_approved = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.purchaser} on {self.product}"

# ---------------------------------------------------------
# COUPONS & PROMO CODES MODEL
# ---------------------------------------------------------

class Coupon(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, limit_choices_to={'role': 'seller'})
    code = models.CharField(max_length=50, unique=True)
    discount_percent = models.PositiveIntegerField(default=10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Coupon {self.code} ({self.discount_percent}%)"

# ---------------------------------------------------------
# HOMEPAGE PROMOTIONAL BANNERS MODEL
# ---------------------------------------------------------

class Banner(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    subtitle = models.TextField(null=True, blank=True)
    badge = models.CharField(max_length=100, default='🔥 Mega Sale')
    cta_text = models.CharField(max_length=100, default='Shop Now')
    image_url = models.URLField(max_length=500, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title