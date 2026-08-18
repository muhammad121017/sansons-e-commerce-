import threading
import stripe
import logging
from decimal import Decimal
from django.conf import settings
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.throttling import ScopedRateThrottle
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.db.models import Sum, F
from django.contrib.auth import get_user_model
User = get_user_model()
from .models import Product, Order, OrderItem, Review, ProductImage, Category
from dashboard.views import IsAdminUser, IsAdminOrSeller

from .serializers import (
    ProductSerializer, ProductDetailSerializer, CheckoutSerializer, 
    SellerProductSerializer, SellerOrderItemSerializer,
    ReviewSerializer, ProductImageSerializer, CategorySerializer
)
from .utils import process_image

# Connect audit logger for financial tracking
audit_logger = logging.getLogger('audit_logger')

stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', 'sk_test_placeholder')

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 50  

class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'public_catalog'
    
    filterset_fields = ['category__slug']
    ordering_fields = ['price', 'created_at']

    def get_queryset(self):
        # STRICT GUARD: Exclude soft-deleted products
        queryset = Product.objects.filter(is_published=True, seller__status='active', deleted_at__isnull=True)
        query_params = self.request.query_params
        
        # 1. PostgreSQL Full-Text Search Engine Integration
        search_term = query_params.get('search', None)
        if search_term:
            vector = SearchVector('title', weight='A') + SearchVector('description', weight='B')
            query = SearchQuery(search_term)
            queryset = queryset.annotate(search=vector).filter(search=query)

        # 2. Seller filter support
        seller_param = query_params.get('seller') or query_params.get('seller_id')
        if seller_param:
            queryset = queryset.filter(seller_id=seller_param)

        # 3. Deal of the Week filter support
        deal_param = query_params.get('is_deal_of_the_week', None)
        if deal_param is not None:
            is_deal = deal_param.lower() in ['true', '1']
            queryset = queryset.filter(is_deal_of_the_week=is_deal)

        # 4. JSONB Dynamic Querying via GIN Index (safeguarded system parameters)
        system_reserved_params = {
            'page', 'page_size', 'search', 'ordering', 'category', 'category__slug', 
            'seller', 'seller_id', 'is_deal_of_the_week', 'format', '_rsc', 'limit', 'offset', 'ts'
        }
        for key, value in query_params.items():
            if key not in system_reserved_params and value:
                queryset = queryset.filter(attributes__contains={key: value})
                
        return queryset

class ProductDetailView(generics.RetrieveAPIView):
    serializer_class = ProductDetailSerializer

    def get_object(self):
        from django.http import Http404
        import uuid
        queryset = Product.objects.filter(is_published=True, seller__status='active', deleted_at__isnull=True)
        lookup = self.kwargs.get('pk')
        try:
            uuid.UUID(lookup)
            return queryset.get(pk=lookup)
        except (ValueError, Product.DoesNotExist):
            try:
                return queryset.get(slug=lookup)
            except Product.DoesNotExist:
                raise Http404("No product matches the given query.")

class CheckoutView(APIView):
    permission_classes = []

    @transaction.atomic
    def post(self, request):
        import uuid
        idempotency_key = request.headers.get('Idempotency-Key') or f"key_{uuid.uuid4()}"

        existing_order = Order.objects.filter(idempotency_key=idempotency_key).first()
        if existing_order:
            return Response({"message": "Order already processed.", "order_id": str(existing_order.id)}, status=status.HTTP_200_OK)

        serializer = CheckoutSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        items_data = serializer.validated_data['items']
        
        customer_phone = request.data.get('phone') or request.data.get('customer_phone') or request.data.get('phone_number') or ''
        if not customer_phone or len(customer_phone.strip()) < 5:
            return Response({"error": "WhatsApp or Phone number is required for shipping updates."}, status=status.HTTP_400_BAD_REQUEST)

        is_guest = True
        if request.user and request.user.is_authenticated:
            purchaser = request.user
            is_guest = False
        else:
            email = request.data.get('email') or request.data.get('customer_email')
            if not email or len(email.strip()) == 0:
                # Generate unique shadow guest email to prevent user conflicts
                email = f"guest_{str(uuid.uuid4())[:8]}@sansons.com"
            
            purchaser, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': 'Guest',
                    'last_name': 'Customer',
                    'role': 'purchaser',
                    'status': 'active'
                }
            )

        order = Order.objects.create(
            purchaser=purchaser,
            is_guest=is_guest,
            shipping_address=serializer.validated_data['shipping_address'],
            billing_address=serializer.validated_data['billing_address'],
            customer_phone=customer_phone,
            idempotency_key=idempotency_key,
            total_amount=0
        )


        total_amount = Decimal('0.00')
        order_items_to_create = []

        for item in items_data:
            product_id = item['product_id']
            quantity = item['quantity']

            product = None
            try:
                product = Product.objects.select_for_update().filter(
                    id=product_id, 
                    is_published=True,
                    deleted_at__isnull=True
                ).first()
            except Exception:
                pass

            if not product:
                product = Product.objects.select_for_update().filter(
                    slug=str(product_id),
                    is_published=True,
                    deleted_at__isnull=True
                ).first()

            if not product:
                product = Product.objects.select_for_update().filter(
                    is_published=True,
                    deleted_at__isnull=True
                ).first()

            if not product:
                return Response({"error": f"Product '{product_id}' is currently unavailable."}, status=status.HTTP_400_BAD_REQUEST)


            if product.stock_quantity < quantity:
                return Response({"error": f"Insufficient stock for {product.title}."}, status=status.HTTP_400_BAD_REQUEST)

            product.stock_quantity -= quantity
            product.save()

            line_item_total = product.price * quantity
            total_amount += line_item_total
            commission_cut = line_item_total * Decimal('0.10')

            order_items_to_create.append(OrderItem(
                order=order,
                product=product,
                seller=product.seller,
                quantity=quantity,
                price_at_purchase=product.price,
                platform_commission=commission_cut
            ))

        OrderItem.objects.bulk_create(order_items_to_create)
        # Add flat 200 PKR shipping charge to the database order total
        order.total_amount = total_amount + Decimal('200.00')
        
        payment_method = serializer.validated_data.get('payment_method', 'cod')
        order.payment_gateway_ref = payment_method
        order.payment_status = 'unpaid' if payment_method == 'cod' else 'paid'
        order.order_status = 'pending'
        order.save()

        audit_logger.info(f"Financial Checkout: Order {order.id} placed by {purchaser.email} for ${total_amount}.")
        from dashboard.models import log_audit_action
        log_audit_action(
            purchaser,
            "Order Placed",
            f"Placed Order #{str(order.id)[:8]} (Payment: {payment_method.upper()}, Total: ${total_amount}) with {len(items_data)} item(s)",
            module="Orders",
            request=request
        )
        return Response({"order_id": str(order.id), "total": str(total_amount), "payment_method": payment_method}, status=status.HTTP_201_CREATED)


        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=stripe_line_items,
                mode='payment',
                success_url='https://yourfrontend.com/success',
                cancel_url='https://yourfrontend.com/cancel',
                client_reference_id=str(order.id)
            )
            return Response({"checkout_url": checkout_session.url, "order_id": order.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class StripeWebhookView(APIView):
    permission_classes = [] 

    def post(self, request):
        payload = request.body
        sig_header = request.headers.get('Stripe-Signature')
        endpoint_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', 'whsec_test_placeholder')

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            order_id = session.get('client_reference_id')
            try:
                order = Order.objects.get(id=order_id)
                # STRICT GUARD: Idempotent state check to prevent duplicate webhook processing
                if order.payment_status == 'paid':
                    return Response(status=status.HTTP_200_OK)

                order.payment_status = 'paid'
                order.order_status = 'processing'
                order.payment_gateway_ref = session.get('payment_intent')
                order.save()
                
                audit_logger.info(f"Financial Webhook: Order {order.id} successfully PAID via Stripe.")
            except Order.DoesNotExist:
                pass
                
        elif event['type'] == 'checkout.session.expired':
            session = event['data']['object']
            order_id = session.get('client_reference_id')
            try:
                order = Order.objects.get(id=order_id)
                if order.payment_status == 'unpaid':
                    order.order_status = 'cancelled'
                    order.save()
                    
                    with transaction.atomic():
                        for item in order.items.select_related('product'):
                            product = Product.objects.select_for_update().get(id=item.product.id)
                            product.stock_quantity += item.quantity
                            product.save()
                    
                    audit_logger.info(f"Financial Webhook: Order {order.id} EXPIRED. Inventory released back to pool.")
            except Order.DoesNotExist:
                pass

        return Response(status=status.HTTP_200_OK)

# --- Seller Dashboard Views ---

class IsSeller(BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role in ['admin', 'seller']:
            return True
        if request.user.role != 'purchaser':
            return True
        if isinstance(request.user.allowed_modules, list) and len(request.user.allowed_modules) > 0:
            return True
        return False

class SellerProductListCreateView(generics.ListCreateAPIView):
    serializer_class = SellerProductSerializer
    permission_classes = [IsSeller]

    def get_queryset(self):
        user = self.request.user
        queryset = Product.objects.filter(deleted_at__isnull=True)

        seller_id = self.request.query_params.get('seller_id') or self.request.query_params.get('seller')
        if seller_id and seller_id != 'all':
            from django.db.models import Q
            queryset = queryset.filter(
                Q(seller_id=seller_id) | 
                Q(seller__id=seller_id) | 
                Q(seller__email__iexact=seller_id)
            )
        elif user and user.is_authenticated and user.role == 'seller':
            queryset = queryset.filter(seller=user)

        return queryset

    def perform_create(self, serializer):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = self.request.user
        if user.role != 'seller':
            seller = User.objects.filter(role='seller', status='active').first() or user
        else:
            seller = user
        product = serializer.save(seller=seller)
        
        from dashboard.models import log_audit_action
        log_audit_action(
            user,
            "Product Created",
            f"Created new product '{product.title}' (SKU: {product.sku}) in category '{product.category.name if product.category else 'Uncategorized'}' with price ${product.price}",
            module="Products",
            request=self.request
        )


class SellerProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SellerProductSerializer
    permission_classes = [IsSeller]

    def get_queryset(self):
        user = self.request.user
        if user.role != 'seller':
            return Product.objects.filter(deleted_at__isnull=True)
        return Product.objects.filter(seller=user, deleted_at__isnull=True)

    def perform_update(self, serializer):
        old_product = self.get_object()
        old_title = old_product.title
        old_price = old_product.price
        old_stock = old_product.stock_quantity
        old_sku = old_product.sku
        old_category = old_product.category
        
        product = serializer.save()
        changes = []
        if old_title != product.title:
            changes.append(f"Title changed from '{old_title}' to '{product.title}'")
        if old_price != product.price:
            changes.append(f"Price changed from ${old_price} to ${product.price}")
        if old_stock != product.stock_quantity:
            changes.append(f"Stock changed from {old_stock} to {product.stock_quantity}")
        if old_sku != product.sku:
            changes.append(f"SKU changed from '{old_sku}' to '{product.sku}'")
        if old_category != product.category:
            changes.append(f"Category changed from '{old_category.name if old_category else 'None'}' to '{product.category.name if product.category else 'None'}'")
            
        from dashboard.models import log_audit_action
        log_audit_action(
            self.request.user,
            "Product Updated",
            f"Updated product '{product.title}' (SKU: {product.sku}): " + (", ".join(changes) if changes else "No field changes"),
            module="Products",
            request=self.request
        )

    def perform_destroy(self, instance):
        product_title = instance.title
        product_sku = instance.sku
        from dashboard.models import log_audit_action
        log_audit_action(
            self.request.user,
            "Product Deleted",
            f"Deleted product '{product_title}' (SKU: {product_sku}) permanently",
            module="Products",
            request=self.request
        )
        instance.delete()

class ProductImageUploadView(APIView):
    permission_classes = [IsSeller]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk, deleted_at__isnull=True)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProductImageSerializer(data=request.data)
        if serializer.is_valid():
            product_image = serializer.save(product=product)
            thread = threading.Thread(target=process_image, args=(product_image.id,))
            thread.start()
            
            from dashboard.models import log_audit_action
            log_audit_action(
                request.user,
                "Product Image Uploaded",
                f"Uploaded a new image for product '{product.title}' (SKU: {product.sku})",
                module="Products",
                request=request
            )
            return Response({"message": "Background processing started."}, status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SellerOrderListView(generics.ListAPIView):
    serializer_class = SellerOrderItemSerializer
    permission_classes = [IsSeller]

    def get_queryset(self):
        user = self.request.user
        if user.role != 'seller':
            return OrderItem.objects.all().order_by('-order__created_at')
        return OrderItem.objects.filter(seller=user).order_by('-order__created_at')

class SellerAnalyticsView(APIView):
    permission_classes = [IsSeller]

    def get(self, request):
        user = request.user
        if user.role != 'seller':
            items = OrderItem.objects.all()
        else:
            items = OrderItem.objects.filter(seller=user)

            
        gross_sales = sum(item.price_at_purchase * item.quantity for item in items)
        units_sold = sum(item.quantity for item in items)
        
        top_products = items.values('product__title').annotate(
            total_revenue=Sum(F('price_at_purchase') * F('quantity')),
            total_units=Sum('quantity')
        ).order_by('-total_revenue')[:5]

        # SBOS Admin Dashboard requires additional fields:
        today = timezone.now().date()
        today_orders = Order.objects.filter(created_at__date=today).count() if request.user.role == 'admin' else Order.objects.filter(items__in=items, created_at__date=today).distinct().count()
        today_revenue_items = items.filter(order__created_at__date=today)
        today_revenue = sum(item.price_at_purchase * item.quantity for item in today_revenue_items)
        
        pending_orders = Order.objects.filter(order_status='pending').count() if request.user.role == 'admin' else Order.objects.filter(items__in=items, order_status='pending').distinct().count()
        completed_orders = Order.objects.filter(order_status='delivered').count() if request.user.role == 'admin' else Order.objects.filter(items__in=items, order_status='delivered').distinct().count()
        
        low_stock_count = Product.objects.filter(stock_quantity__lte=5).count() if request.user.role == 'admin' else Product.objects.filter(seller=request.user, stock_quantity__lte=5).count()
        
        # Approximate unique customers
        active_customers = Order.objects.values('purchaser').distinct().count()

        return Response({
            "gross_sales": str(gross_sales),
            "total_units_sold": units_sold,
            "top_performing_products": list(top_products),
            "todayRevenue": today_revenue,
            "todayOrders": today_orders,
            "pendingOrders": pending_orders,
            "completedOrders": completed_orders,
            "activeCustomers": active_customers,
            "newCustomers": 0,
            "averageOrderValue": float(gross_sales) / max(1, items.values('order').distinct().count()),
            "lowStockCount": low_stock_count
        })

class SellerActivityView(APIView):
    permission_classes = [IsSeller]

    def get(self, request):
        if request.user.role == 'admin':
            recent_orders = Order.objects.all().order_by('-created_at')[:10]
        else:
            recent_orders = Order.objects.filter(items__seller=request.user).distinct().order_by('-created_at')[:10]
            
        activities = []
        for order in recent_orders:
            activities.append({
                "id": str(order.id),
                "type": "order",
                "message": f"New order #{str(order.id)[:8]} placed",
                "timestamp": order.created_at.isoformat(),
            })
            
        return Response(activities)

class ReviewListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer

    def get_permissions(self):
        return []

    def get_queryset(self):
        qs = Review.objects.filter(is_approved=True).order_by('-created_at')
        product_id = self.request.query_params.get('product') or self.request.query_params.get('product_id')
        product_slug = self.request.query_params.get('slug') or self.request.query_params.get('product_slug')
        
        if product_id:
            qs = qs.filter(product_id=product_id)
        elif product_slug:
            qs = qs.filter(product__slug=product_slug)
            
        return qs

    def perform_create(self, serializer):
        user = self.request.user if self.request.user and self.request.user.is_authenticated else None
        author_name = self.request.data.get('author_name')
        if not author_name and user:
            author_name = f"{user.first_name} {user.last_name}".strip() or user.email
        if not author_name:
            author_name = 'Verified Buyer'

        serializer.save(
            purchaser=user,
            author_name=author_name,
            is_approved=True
        )

from dashboard.views import IsAdminOrSeller
from django.utils.text import slugify

class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return []
        return [IsAdminOrSeller()]

    def get_queryset(self):
        from django.db.models import Count, Q
        user = self.request.user
        queryset = Category.objects.filter(deleted_at__isnull=True)
        
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        elif user and user.is_authenticated and user.role == 'seller':
            queryset = queryset.filter(Q(status='approved') | Q(requested_by=user))
        elif not (user and user.is_authenticated and user.role in ['admin', 'manager']):
            queryset = queryset.filter(status='approved')
            
        return queryset.annotate(
            count=Count('products', filter=Q(products__deleted_at__isnull=True, products__is_published=True))
        ).order_by('name')

    def perform_create(self, serializer):
        name = serializer.validated_data.get('name')
        base_slug = serializer.validated_data.get('slug') or slugify(name)
        slug = base_slug
        counter = 1
        while Category.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        user = self.request.user
        
        if user and user.is_authenticated and user.role == 'seller':
            category = serializer.save(slug=slug, status='pending', requested_by=user)
            action_title = "Category Requested"
            log_msg = f"Requested new category '{category.name}' (Pending Admin Approval)"
        else:
            category = serializer.save(slug=slug, status='approved', requested_by=user if (user and user.is_authenticated) else None)
            action_title = "Category Created"
            log_msg = f"Created new active category '{category.name}' (Slug: {category.slug})"
            
        try:
            from dashboard.models import log_audit_action
            log_audit_action(
                user,
                action_title,
                log_msg,
                module="Categories",
                request=self.request
            )
        except Exception:
            pass

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    queryset = Category.objects.filter(deleted_at__isnull=True)

    def get_permissions(self):
        if self.request.method == 'GET':
            return []
        return [IsAdminOrSeller()]

    def perform_update(self, serializer):
        old_category = self.get_object()
        old_name = old_category.name
        old_slug = old_category.slug
        category = serializer.save()
        changes = []
        if old_name != category.name:
            changes.append(f"Name changed from '{old_name}' to '{category.name}'")
        if old_slug != category.slug:
            changes.append(f"Slug changed from '{old_slug}' to '{category.slug}'")
        
        from dashboard.models import log_audit_action
        log_audit_action(
            self.request.user,
            "Category Updated",
            f"Updated category '{category.name}': " + (", ".join(changes) if changes else "No field changes"),
            module="Categories",
            request=self.request
        )

    def perform_destroy(self, instance):
        category_name = instance.name
        from dashboard.models import log_audit_action
        log_audit_action(
            self.request.user,
            "Category Deleted",
            f"Deleted category '{category_name}' permanently",
            module="Categories",
            request=self.request
        )
        instance.delete()


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user 
            and request.user.is_authenticated 
            and (request.user.role == 'admin' or request.user.is_staff or request.user.is_superuser)
        )

class CategoryModerateView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        from dashboard.models import log_audit_action
        try:
            category = Category.objects.get(pk=pk, deleted_at__isnull=True)
        except Category.DoesNotExist:
            return Response({"error": "Category not found."}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')  # 'approve' or 'reject'
        reason = request.data.get('reason', '')

        if action == 'approve':
            category.status = 'approved'
            category.rejection_reason = None
            category.save()
            log_audit_action(
                request.user,
                "Category Approved",
                f"Approved category '{category.name}' requested by {category.requested_by.email if category.requested_by else 'system'}",
                module="Categories",
                request=request
            )
            return Response({"message": f"Category '{category.name}' has been approved and is now live marketplace-wide.", "status": "approved"})
        elif action == 'reject':
            category.status = 'rejected'
            category.rejection_reason = reason
            category.save()
            log_audit_action(
                request.user,
                "Category Rejected",
                f"Rejected category '{category.name}' requested by {category.requested_by.email if category.requested_by else 'system'}. Reason: {reason}",
                module="Categories",
                request=request
            )
            return Response({"message": f"Category '{category.name}' request has been rejected.", "status": "rejected"})

        return Response({"error": "Invalid action. Use 'approve' or 'reject'."}, status=status.HTTP_400_BAD_REQUEST)



# --- Public Banners & Coupon Validation Views ---

from .models import Banner, Coupon
from dashboard.serializers import BannerSerializer

class PublicBannerListView(generics.ListAPIView):
    permission_classes = []
    serializer_class = BannerSerializer
    queryset = Banner.objects.filter(is_active=True).order_by('-created_at')

class ValidateCouponView(APIView):
    permission_classes = []

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        if not code:
            return Response({"error": "Coupon code is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            coupon = Coupon.objects.get(code=code, is_active=True)
            return Response({
                "valid": True,
                "code": coupon.code,
                "discount_percent": coupon.discount_percent,
                "message": f"Coupon '{coupon.code}' applied! ({coupon.discount_percent}% OFF)"
            })
        except Coupon.DoesNotExist:
            return Response({"error": "Invalid or expired promo code."}, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

class ClaimOrderView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request, pk):
        try:
            order = Order.objects.select_for_update().get(pk=pk)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if not order.is_guest:
            return Response({"error": "This order has already been claimed or is linked to an account."}, status=status.HTTP_400_BAD_REQUEST)

        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')
        first_name = request.data.get('first_name', 'Valued')
        last_name = request.data.get('last_name', 'Customer')

        if not email or not password:
            return Response({"error": "Both email and password are required to create/claim your account."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if user already exists
        user = User.objects.filter(email__iexact=email).first()
        if user:
            # Login check
            if not user.check_password(password):
                return Response({"error": "An account with this email already exists and password did not match. Please enter the correct password to link this order."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Register new purchaser account
            user = User.objects.create(
                email=email,
                first_name=first_name,
                last_name=last_name,
                role='purchaser',
                status='active',
                phone_number=order.customer_phone,
                is_staff=False
            )
            user.set_password(password)
            user.save()
            
            from dashboard.models import log_audit_action
            log_audit_action(
                user=user,
                action="Guest Account Registration",
                details=f"User {user.email} registered an account post-checkout to claim order {order.id}",
                module="Auth",
                request=request
            )

        # Associate this order and any other matching guest orders (by phone) to this user
        phone = order.customer_phone
        orders_to_link = Order.objects.filter(customer_phone=phone, is_guest=True)
        linked_count = orders_to_link.count()
        orders_to_link.update(purchaser=user, is_guest=False)

        # Log audit action
        from dashboard.models import log_audit_action
        log_audit_action(
            user=user,
            action="Guest Orders Claimed",
            details=f"Linked {linked_count} guest order(s) under WhatsApp/phone number {phone} to account {user.email}",
            module="Orders",
            request=request
        )

        # Generate access/refresh tokens to log the user in instantly
        refresh = RefreshToken.for_user(user)
        refresh['email'] = user.email
        refresh['role'] = user.role
        refresh['allowed_modules'] = user.allowed_modules or []

        return Response({
            'message': f"Successfully claimed {linked_count} order(s). You are now logged in!",
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