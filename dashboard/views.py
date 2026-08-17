from django.shortcuts import render
import logging
from datetime import timedelta
from decimal import Decimal
from django.utils import timezone
from django.db.models import Sum, F
from django.db.models.functions import TruncDate
from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from django.contrib.auth import get_user_model
from products.models import OrderItem, Product, Review, Banner, Coupon, Order
from .models import SiteCMS, SiteSettings, log_audit_action
from .serializers import (
    RedactedOrderSerializer, LowStockAlertSerializer, AdminSellerSerializer,
    AdminReviewSerializer, BannerSerializer, CouponSerializer,
    SiteCMSSerializer, SiteSettingsSerializer, AdminOrderSerializer
)

User = get_user_model()
audit_logger = logging.getLogger('audit_logger')

class IsAdminOrSeller(BasePermission):
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


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class VendorDashboardOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'seller':
            return Response({"error": "Unauthorized. Seller access only."}, status=403)

        thirty_days_ago = timezone.now() - timedelta(days=30)
        seller_items = OrderItem.objects.filter(
            seller=user, 
            order__created_at__gte=thirty_days_ago
        )

        time_series_sales = seller_items.annotate(
            date=TruncDate('order__created_at')
        ).values('date').annotate(
            daily_revenue=Sum(F('price_at_purchase') * F('quantity')),
            items_sold=Sum('quantity')
        ).order_by('date')

        total_revenue = sum(day['daily_revenue'] for day in time_series_sales) if time_series_sales else 0

        low_stock_products = Product.objects.filter(
            seller=user, 
            stock_quantity__lt=10, 
            deleted_at__isnull=True
        )
        low_stock_data = LowStockAlertSerializer(low_stock_products, many=True).data

        audit_logger.info(f"Dashboard Access: Seller {user.id} pulled protected time-series analytics.")

        return Response({
            "total_30d_revenue": str(total_revenue),
            "time_series_sales": list(time_series_sales),
            "low_stock_alerts": low_stock_data,
            "low_stock_count": low_stock_products.count()
        })

class VendorRedactedOrdersView(generics.ListAPIView):
    serializer_class = RedactedOrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return OrderItem.objects.filter(
            seller=self.request.user
        ).select_related('order', 'product').order_by('-order__created_at')

class AdminSellerListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminSellerSerializer

    def get_queryset(self):
        queryset = User.objects.filter(role='seller').order_by('-created_at')
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset

class AdminVerifySellerView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            seller = User.objects.get(pk=pk, role='seller')
        except User.DoesNotExist:
            return Response({"error": "Seller not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status not in ['active', 'suspended', 'pending_verification']:
            return Response({"error": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)

        old_status = seller.status
        seller.status = new_status
        seller.save()
        audit_logger.info(f"Admin Moderation: Seller {seller.email} status updated to {new_status} by Admin {request.user.email}")
        log_audit_action(
            request.user,
            "Seller Status Updated",
            f"Updated status for seller {seller.email} from '{old_status}' to '{new_status}'",
            module="Users",
            request=request
        )
        return Response({"message": f"Seller status successfully updated to {new_status}."})

class AdminReviewListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminReviewSerializer

    def get_queryset(self):
        queryset = Review.objects.all().order_by('-created_at')
        approved_param = self.request.query_params.get('is_approved')
        if approved_param is not None:
            is_approved = approved_param.lower() in ['true', '1']
            queryset = queryset.filter(is_approved=is_approved)
        return queryset

class AdminApproveReviewView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            review = Review.objects.get(pk=pk)
        except Review.DoesNotExist:
            return Response({"error": "Review not found."}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')
        if action == 'approve':
            review.is_approved = True
            review.save()
            audit_logger.info(f"Admin Moderation: Review {review.id} approved by Admin {request.user.email}")
            log_audit_action(
                request.user,
                "Review Approved",
                f"Approved review #{review.id} on product '{review.product.title if review.product else 'Unknown Product'}'",
                module="Reviews",
                request=request
            )
            return Response({"message": "Review approved successfully."})
        elif action == 'delete':
            product_title = review.product.title if review.product else 'Unknown Product'
            review.delete()
            audit_logger.info(f"Admin Moderation: Review {review.id} deleted by Admin {request.user.email}")
            log_audit_action(
                request.user,
                "Review Deleted",
                f"Deleted review #{review.id} on product '{product_title}'",
                module="Reviews",
                request=request
            )
            return Response({"message": "Review deleted successfully."})
        else:
            return Response({"error": "Invalid action. Use 'approve' or 'delete'."}, status=status.HTTP_400_BAD_REQUEST)

from products.serializers import ProductSerializer

class AdminProductListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = ProductSerializer

    def get_queryset(self):
        return Product.objects.filter(deleted_at__isnull=True).order_by('-created_at')

class AdminToggleDealView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk, deleted_at__isnull=True)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        is_deal = request.data.get('is_deal_of_the_week')
        if is_deal is not None:
            if is_deal:
                Product.objects.filter(is_deal_of_the_week=True).update(is_deal_of_the_week=False)
            product.is_deal_of_the_week = bool(is_deal)

        compare_at_price = request.data.get('compare_at_price')
        if compare_at_price is not None:
            product.compare_at_price = compare_at_price if compare_at_price else None

        price = request.data.get('price')
        if price is not None and price != '':
            product.price = price

        product.save()
        audit_logger.info(f"Admin Moderation: Product {product.id} deal status updated by {request.user.email}")
        
        detail_msg = f"Updated deal settings for product '{product.title}' (SKU: {product.sku}): "
        settings_changes = []
        if is_deal is not None:
            settings_changes.append(f"Deal of the week: {product.is_deal_of_the_week}")
        if compare_at_price is not None:
            settings_changes.append(f"Compare at price: ${product.compare_at_price}")
        if price is not None and price != '':
            settings_changes.append(f"Price: ${product.price}")
        detail_msg += ", ".join(settings_changes)

        log_audit_action(
            request.user,
            "Product Deal Settings Updated",
            detail_msg,
            module="Products",
            request=request
        )

        return Response({
            "message": "Product deal settings updated successfully.",
            "is_deal_of_the_week": product.is_deal_of_the_week,
            "price": str(product.price),
            "compare_at_price": str(product.compare_at_price) if product.compare_at_price else None
        })

class AdminPlatformOverviewView(APIView):
    permission_classes = [IsAdminOrSeller]

    def get(self, request):
        user = request.user
        seller_id = request.query_params.get('seller_id')

        if user.role == 'seller' or (seller_id and seller_id != 'all'):
            target_seller_id = user.id if user.role == 'seller' else seller_id
            if '-' in str(target_seller_id):
                seller_items = OrderItem.objects.filter(seller_id=target_seller_id).exclude(order__order_status__in=['cancelled', 'refunded'])
            else:
                seller_items = OrderItem.objects.filter(seller__email__iexact=target_seller_id).exclude(order__order_status__in=['cancelled', 'refunded'])
            valid_orders_ids = seller_items.values_list('order_id', flat=True).distinct()
            total_orders = len(valid_orders_ids)
            pending_orders = seller_items.filter(item_status__in=['pending', 'processing']).count()

            total_gmv = sum((item.price_at_purchase * item.quantity) for item in seller_items) if seller_items else Decimal('0.00')
            total_commission = sum(item.platform_commission for item in seller_items) if seller_items else Decimal('0.00')
            net_vendor_payouts = total_gmv - total_commission
            active_sellers_count = 1
            avg_order_value = total_gmv / Decimal(str(max(1, total_orders))) if total_orders > 0 else Decimal('0.00')

            return Response({
                "total_gmv": str(total_gmv),
                "total_revenue": str(total_gmv),
                "total_commission": str(total_commission),
                "net_vendor_payouts": str(net_vendor_payouts),
                "total_orders": total_orders,
                "pending": pending_orders,
                "pending_orders": pending_orders,
                "avg_order_value": str(round(avg_order_value, 2)),
                "active_sellers": active_sellers_count
            })

        valid_orders = Order.objects.exclude(order_status__in=['cancelled', 'refunded'])
        total_orders = valid_orders.count()
        pending_orders = valid_orders.filter(order_status__in=['pending', 'processing']).count()
        
        gmv_agg = valid_orders.aggregate(total=Sum('total_amount'))['total']
        total_gmv = gmv_agg if gmv_agg is not None else Decimal('0.00')
        
        all_order_items = OrderItem.objects.filter(order__in=valid_orders)
        total_commission = sum(item.platform_commission for item in all_order_items) if all_order_items else Decimal('0.00')
        net_vendor_payouts = total_gmv - total_commission
        
        active_sellers_count = User.objects.filter(role='seller', status='active').count()
        avg_order_value = total_gmv / Decimal(str(max(1, total_orders))) if total_orders > 0 else Decimal('0.00')

        return Response({
            "total_gmv": str(total_gmv),
            "total_revenue": str(total_gmv),
            "total_commission": str(total_commission),
            "net_vendor_payouts": str(net_vendor_payouts),
            "total_orders": total_orders,
            "pending": pending_orders,
            "pending_orders": pending_orders,
            "avg_order_value": str(round(avg_order_value, 2)),
            "active_sellers": active_sellers_count
        })


class VendorUpdateFulfillmentStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            order_item = OrderItem.objects.get(pk=pk, seller=request.user)
        except OrderItem.DoesNotExist:
            return Response({"error": "Order line not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('item_status')
        tracking_number = request.data.get('tracking_number')

        if new_status:
            order_item.item_status = new_status
        if tracking_number is not None:
            order_item.tracking_number = tracking_number

        order_item.save()
        audit_logger.info(f"Fulfillment: OrderItem {order_item.id} updated by seller {request.user.email} -> {new_status}")
        return Response({
            "message": "Fulfillment status updated.",
            "item_status": order_item.item_status,
            "tracking_number": order_item.tracking_number
        })

class AdminBannerListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = BannerSerializer
    queryset = Banner.objects.all().order_by('-created_at')

class VendorCouponListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CouponSerializer

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Coupon.objects.all().order_by('-created_at')
        return Coupon.objects.filter(seller=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        coupon = serializer.save(seller=self.request.user)
        log_audit_action(
            self.request.user,
            "Coupon Created",
            f"Created coupon '{coupon.code}' with {coupon.discount_percent}% discount",
            module="Coupons",
            request=self.request
        )

class VendorCouponDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CouponSerializer

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Coupon.objects.all().order_by('-created_at')
        return Coupon.objects.filter(seller=self.request.user).order_by('-created_at')

    def perform_update(self, serializer):
        old_coupon = self.get_object()
        old_code = old_coupon.code
        old_discount = old_coupon.discount_percent
        old_active = old_coupon.is_active
        
        coupon = serializer.save()
        changes = []
        if old_code != coupon.code:
            changes.append(f"Code changed from '{old_code}' to '{coupon.code}'")
        if old_discount != coupon.discount_percent:
            changes.append(f"Discount changed from {old_discount}% to {coupon.discount_percent}%")
        if old_active != coupon.is_active:
            changes.append(f"Status changed from {'Active' if old_active else 'Inactive'} to {'Active' if coupon.is_active else 'Inactive'}")
            
        log_audit_action(
            self.request.user,
            "Coupon Updated",
            f"Updated coupon '{coupon.code}': " + (", ".join(changes) if changes else "No field changes"),
            module="Coupons",
            request=self.request
        )

    def perform_destroy(self, instance):
        coupon_code = instance.code
        log_audit_action(
            self.request.user,
            "Coupon Deleted",
            f"Deleted coupon '{coupon_code}' permanently",
            module="Coupons",
            request=self.request
        )
        instance.delete()

from rest_framework import serializers

class UserManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'status', 'allowed_modules', 'created_at')
        extra_kwargs = {
            'email': {'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False},
            'role': {'required': False},
            'status': {'required': False},
            'allowed_modules': {'required': False},
        }

class AdminUserManagementView(generics.ListCreateAPIView):
    permission_classes = [IsAdminOrSeller]
    serializer_class = UserManagementSerializer

    def get_queryset(self):
        return User.objects.all().order_by('-created_at')

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        role = request.data.get('role', 'purchaser')
        user_status = request.data.get('status', 'active')
        allowed_modules = request.data.get('allowed_modules', [])

        if not email or not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"error": "A user with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=role,
            status=user_status,
            allowed_modules=allowed_modules
        )
        audit_logger.info(f"Admin User Management: User {user.email} created with role {role} and permissions {allowed_modules} by Admin/Seller {request.user.email}")
        log_audit_action(
            request.user,
            "User Created",
            f"Created staff account {user.email} with role '{role}' and limited access",
            module="Users",
            request=request
        )
        return Response(UserManagementSerializer(user).data, status=status.HTTP_201_CREATED)

class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOrSeller]
    queryset = User.objects.all()
    serializer_class = UserManagementSerializer

    def perform_destroy(self, instance):
        if instance == self.request.user:
            raise serializers.ValidationError("Cannot delete your own active administrator account.")
        email_to_delete = instance.email
        audit_logger.info(f"Admin User Management: User {instance.email} deleted by Admin/Seller {self.request.user.email}")
        log_audit_action(
            self.request.user,
            "User Deleted",
            f"Deleted user account {email_to_delete} permanently from the system",
            module="Users",
            request=self.request
        )
        instance.delete()

    def perform_update(self, serializer):
        instance = serializer.save()
        if 'password' in self.request.data and self.request.data['password']:
            instance.set_password(self.request.data['password'])
            instance.save()
        if 'allowed_modules' in self.request.data:
            instance.allowed_modules = self.request.data['allowed_modules']
            instance.save()
        audit_logger.info(f"Admin User Management: User {instance.email} updated by Admin/Seller {self.request.user.email}")
        log_audit_action(
            self.request.user,
            "User Role & Access Updated",
            f"Updated role and permissions for user {instance.email} (new role: '{instance.role}')",
            module="Users",
            request=self.request
        )



DEFAULT_HOMEPAGE_SECTIONS = [
    {"id": "hero", "label": "Hero Banner & Carousel", "visible": True, "order": 1},
    {"id": "badges", "label": "Value Proposition Badges", "visible": True, "order": 2},
    {"id": "categories", "label": "Featured Categories Grid", "visible": True, "order": 3},
    {"id": "deal", "label": "Deal of the Week Banner", "visible": True, "order": 4},
    {"id": "bestsellers", "label": "Best Sellers Product Grid", "visible": True, "order": 5},
    {"id": "story", "label": "Brand Story Section", "visible": True, "order": 6},
    {"id": "reviews", "label": "Customer Reviews & Ratings", "visible": True, "order": 7},
    {"id": "faq", "label": "Frequently Asked Questions (FAQ)", "visible": True, "order": 8},
]

class SiteCMSView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return []
        return [IsAdminOrSeller()]

    def get(self, request):
        cms, _ = SiteCMS.objects.get_or_create(id='default')
        existing_ids = {s.get('id') for s in (cms.homepage_sections or []) if isinstance(s, dict)}
        if len(existing_ids) < len(DEFAULT_HOMEPAGE_SECTIONS):
            new_sections = list(cms.homepage_sections or [])
            for default_sec in DEFAULT_HOMEPAGE_SECTIONS:
                if default_sec['id'] not in existing_ids:
                    new_sections.append(default_sec)
            cms.homepage_sections = new_sections
            cms.save()
        return Response(SiteCMSSerializer(cms).data)

    def post(self, request):
        return self.update_cms(request)

    def put(self, request):
        return self.update_cms(request)

    def update_cms(self, request):
        cms, _ = SiteCMS.objects.get_or_create(id='default')
        data = request.data
        if 'homepage_sections' in data:
            cms.homepage_sections = data['homepage_sections']
        if 'hero_slides' in data:
            cms.hero_slides = data['hero_slides']
        if 'announcement_bar' in data:
            cms.announcement_bar = data['announcement_bar']
        if 'brand_story' in data:
            cms.brand_story = data['brand_story']
        if 'faq_items' in data:
            cms.faq_items = data['faq_items']
        if 'featured_categories' in data:
            cms.featured_categories = data['featured_categories']
        if 'featured_products' in data:
            cms.featured_products = data['featured_products']
        if 'footer_content' in data:
            cms.footer_content = data['footer_content']
        cms.save()
        audit_logger.info(f"Site CMS updated by user {request.user.email}")
        changed_sections = [k for k in ['homepage_sections', 'hero_slides', 'announcement_bar', 'brand_story', 'faq_items', 'featured_categories', 'featured_products', 'footer_content'] if k in data]
        log_audit_action(
            request.user,
            "CMS Content Updated",
            f"Updated homepage CMS content: {', '.join(changed_sections)}",
            module="CMS",
            request=request
        )
        return Response(SiteCMSSerializer(cms).data)


class SiteSettingsView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return []
        return [IsAdminOrSeller()]

    def get(self, request):
        settings_obj, _ = SiteSettings.objects.get_or_create(id='default')
        return Response(SiteSettingsSerializer(settings_obj).data)

    def post(self, request):
        return self.update_settings(request)

    def put(self, request):
        return self.update_settings(request)

    def update_settings(self, request):
        settings_obj, _ = SiteSettings.objects.get_or_create(id='default')
        data = request.data
        if 'support_email' in data:
            settings_obj.support_email = data['support_email']
        if 'support_phone' in data:
            settings_obj.support_phone = data['support_phone']
        if 'store_address' in data:
            settings_obj.store_address = data['store_address']
        if 'currency' in data:
            settings_obj.currency = data['currency']
        if 'free_shipping_threshold' in data:
            settings_obj.free_shipping_threshold = data['free_shipping_threshold']
        if 'flat_shipping_rate' in data:
            settings_obj.flat_shipping_rate = data['flat_shipping_rate']
        if 'cod_enabled' in data:
            settings_obj.cod_enabled = data['cod_enabled']
        if 'maintenance_mode' in data:
            settings_obj.maintenance_mode = data['maintenance_mode']

        if 'shipper_name' in data:
            settings_obj.shipper_name = data['shipper_name']
        if 'shipper_address' in data:
            settings_obj.shipper_address = data['shipper_address']
        if 'shipper_phone' in data:
            settings_obj.shipper_phone = data['shipper_phone']
        if 'shipper_email' in data:
            settings_obj.shipper_email = data['shipper_email']
        if 'return_policy_note' in data:
            settings_obj.return_policy_note = data['return_policy_note']

        settings_obj.save()
        audit_logger.info(f"Site Settings updated by user {request.user.email}")
        
        changed_fields = [k for k in ['store_name', 'support_email', 'support_phone', 'store_address', 'currency', 'free_shipping_threshold', 'flat_shipping_rate', 'cod_enabled', 'maintenance_mode', 'shipper_name', 'shipper_address', 'shipper_phone', 'shipper_email', 'return_policy_note'] if k in data]
        log_audit_action(
            request.user,
            "Settings Updated",
            f"Updated system settings: {', '.join(changed_fields) if changed_fields else 'No changes'}",
            module="Settings",
            request=request
        )
        return Response(SiteSettingsSerializer(settings_obj).data)

class AdminOrderListView(generics.ListAPIView):
    permission_classes = [IsAdminOrSeller]
    serializer_class = AdminOrderSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Order.objects.all().order_by('-created_at')
        if user.role == 'seller':
            queryset = queryset.filter(items__seller=user).distinct()
        else:
            seller_id = self.request.query_params.get('seller_id') or self.request.query_params.get('seller')
            if seller_id and seller_id != 'all':
                from django.db.models import Q
                queryset = queryset.filter(
                    Q(items__seller_id=seller_id) | 
                    Q(items__seller__id=seller_id) | 
                    Q(items__seller__email__iexact=seller_id)
                ).distinct()
        return queryset

class AdminOrderDetailView(APIView):
    permission_classes = [IsAdminOrSeller]

    def patch(self, request, pk):
        from django.db import transaction
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('order_status') or request.data.get('status')
        if new_status:
            old_status = order.order_status
            new_status_clean = new_status.lower()
            
            # Stock Restoration: If order is cancelled/refunded and was NOT previously cancelled/refunded
            if new_status_clean in ['cancelled', 'refunded'] and old_status not in ['cancelled', 'refunded']:
                with transaction.atomic():
                    for item in order.items.select_related('product'):
                        if item.product:
                            product = Product.objects.select_for_update().filter(id=item.product.id).first()
                            if product:
                                product.stock_quantity += item.quantity
                                product.save()
            # If un-cancelling a previously cancelled order
            elif old_status in ['cancelled', 'refunded'] and new_status_clean not in ['cancelled', 'refunded']:
                with transaction.atomic():
                    for item in order.items.select_related('product'):
                        if item.product:
                            product = Product.objects.select_for_update().filter(id=item.product.id).first()
                            if product:
                                product.stock_quantity = max(0, product.stock_quantity - item.quantity)
                                product.save()

            order.order_status = new_status_clean
            order.save()
            order.items.update(item_status=new_status_clean)
            audit_logger.info(f"Admin Order {order.id} status updated from {old_status} to {new_status_clean} by {request.user.email}")
            
            log_audit_action(
                request.user,
                "Order Status Updated",
                f"Updated Order #{str(order.id)[:8]} status from '{old_status}' to '{new_status_clean}'",
                module="Orders",
                request=request
            )

        return Response(AdminOrderSerializer(order).data)

class AdminTogglePublishView(APIView):
    permission_classes = [IsAdminOrSeller]

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk, deleted_at__isnull=True)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        is_published = request.data.get('is_published')
        if is_published is not None:
            product.is_published = bool(is_published)
        else:
            product.is_published = not product.is_published

        product.save()
        audit_logger.info(f"Admin Product {product.id} visibility toggled to is_published={product.is_published} by {request.user.email}")
        
        log_audit_action(
            request.user,
            "Product Visibility Toggled",
            f"Toggled product '{product.title}' (SKU: {product.sku}) to {'Published' if product.is_published else 'Hidden'}",
            module="Products",
            request=request
        )

        return Response({
            "message": f"Product is now {'visible on storefront' if product.is_published else 'hidden from storefront'}.",
            "is_published": product.is_published
        })

from .models import AuditLog
from .serializers import AuditLogSerializer

class AdminAuditLogView(generics.ListAPIView):
    permission_classes = [IsAdminOrSeller]
    serializer_class = AuditLogSerializer

    def get_queryset(self):
        queryset = AuditLog.objects.all().order_by('-created_at')
        module_param = self.request.query_params.get('module')
        if module_param and module_param != 'all':
            queryset = queryset.filter(module__iexact=module_param)
        return queryset


from rest_framework.permissions import AllowAny
from .models import VisitorActivity
from django.utils import timezone
from datetime import timedelta

class VisitorActivityRecordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        session_id = data.get('session_id')
        page_url = data.get('page_url', '')
        action = data.get('action', 'page_view')

        ip = None
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')

        user_agent = request.META.get('HTTP_USER_AGENT', '')
        user = request.user if request.user and request.user.is_authenticated else None
        
        user_email = None
        if user:
            user_email = user.email
        else:
            user_email = data.get('user_email') or 'Guest'

        VisitorActivity.objects.create(
            user=user,
            user_email=user_email,
            session_id=session_id,
            ip_address=ip,
            user_agent=user_agent,
            page_url=page_url,
            action=action
        )
        return Response({"status": "success"}, status=201)

class AdminVisitorActivityLogsView(APIView):
    permission_classes = [IsAdminOrSeller]

    def get(self, request):
        # Stats Calculations
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        total_views_today = VisitorActivity.objects.filter(created_at__gte=today_start).count()
        unique_sessions_today = VisitorActivity.objects.filter(created_at__gte=today_start).values('session_id').distinct().count()
        
        registered_count_today = VisitorActivity.objects.filter(
            created_at__gte=today_start
        ).exclude(user_email='Guest').values('user_email').distinct().count()
        
        # Paginated Logs List
        logs = VisitorActivity.objects.all().order_by('-created_at')[:100]
        logs_data = []
        for l in logs:
            logs_data.append({
                "id": str(l.id),
                "user_email": l.user_email or 'Guest',
                "session_id": l.session_id,
                "ip_address": l.ip_address,
                "user_agent": l.user_agent,
                "page_url": l.page_url,
                "action": l.action,
                "created_at": l.created_at.isoformat()
            })

        return Response({
            "total_views_today": total_views_today,
            "unique_sessions_today": unique_sessions_today,
            "registered_count_today": registered_count_today,
            "logs": logs_data
        })