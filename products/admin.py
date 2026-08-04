from django.contrib import admin
from .models import Category, Product, Order, OrderItem, Review

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    # Enforce read-only for order items to protect historical financial integrity
    readonly_fields = ('price_at_purchase', 'product', 'seller', 'quantity') 

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'price', 'compare_at_price', 'is_deal_of_the_week', 'stock_quantity', 'is_published', 'seller')
    list_editable = ('is_deal_of_the_week', 'price', 'compare_at_price', 'is_published')
    list_filter = ('is_deal_of_the_week', 'is_published', 'category', 'seller') 
    prepopulated_fields = {'slug': ('title',)}

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'purchaser', 'total_amount', 'order_status', 'payment_status', 'created_at')
    list_filter = ('order_status', 'payment_status')
    inlines = [OrderItemInline]
    # Enforce read-only for financial fields
    readonly_fields = ('total_amount', 'created_at') 

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'purchaser', 'rating', 'is_approved')
    list_filter = ('is_approved', 'rating')