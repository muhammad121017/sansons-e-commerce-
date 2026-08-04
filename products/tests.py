from django.test import TestCase
from django.contrib.auth import get_user_model
from decimal import Decimal
import uuid

from products.models import Category, Product, Order, OrderItem, Review, ProductImage
from products.serializers import (
    CategorySerializer,
    ProductSerializer,
    ProductDetailSerializer,
    CartItemSerializer,
    CheckoutSerializer,
    SellerProductSerializer,
    ProductImageSerializer,
    SellerOrderItemSerializer,
    ReviewSerializer
)

User = get_user_model()

class SerializerTestCase(TestCase):
    def setUp(self):
        self.seller = User.objects.create_user(
            email="seller@example.com",
            password="password123",
            role="seller",
            first_name="Seller",
            last_name="One"
        )
        self.purchaser = User.objects.create_user(
            email="buyer@example.com",
            password="password123",
            role="purchaser",
            first_name="Buyer",
            last_name="One"
        )
        self.category = Category.objects.create(
            name="Electronics",
            slug="electronics"
        )
        self.product = Product.objects.create(
            seller=self.seller,
            category=self.category,
            title="Smartphone",
            slug="smartphone",
            description="A great phone",
            price=Decimal("499.99"),
            stock_quantity=5,
            is_published=True
        )

    def test_category_serializer(self):
        serializer = CategorySerializer(self.category)
        data = serializer.data
        self.assertEqual(data["name"], "Electronics")
        self.assertEqual(data["slug"], "electronics")

    def test_product_serializer(self):
        serializer = ProductSerializer(self.product)
        data = serializer.data
        self.assertEqual(data["title"], "Smartphone")
        self.assertEqual(data["category"]["name"], "Electronics")
        self.assertEqual(Decimal(str(data["price"])), Decimal("499.99"))

    def test_product_detail_serializer(self):
        Review.objects.create(
            product=self.product,
            purchaser=self.purchaser,
            rating=5,
            comment="Awesome phone!",
            is_approved=True
        )
        # Unapproved review should not appear
        Review.objects.create(
            product=self.product,
            purchaser=self.purchaser,
            rating=1,
            comment="Bad phone",
            is_approved=False
        )

        serializer = ProductDetailSerializer(self.product)
        data = serializer.data
        self.assertEqual(len(data["reviews"]), 1)
        self.assertEqual(data["reviews"][0]["comment"], "Awesome phone!")

    def test_cart_item_and_checkout_serializer(self):
        payload = {
            "items": [
                {"product_id": str(self.product.id), "quantity": 2}
            ],
            "shipping_address": "123 Main St",
            "billing_address": "123 Main St"
        }
        serializer = CheckoutSerializer(data=payload)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["items"][0]["quantity"], 2)

    def test_seller_product_serializer(self):
        serializer = SellerProductSerializer(self.product)
        data = serializer.data
        self.assertTrue(data["low_stock_alert"]) # stock_quantity = 5 (< 10)

    def test_seller_order_item_serializer(self):
        order = Order.objects.create(
            purchaser=self.purchaser,
            total_amount=Decimal("499.99"),
            shipping_address="123 Street",
            billing_address="123 Street"
        )
        order_item = OrderItem.objects.create(
            order=order,
            product=self.product,
            seller=self.seller,
            quantity=1,
            price_at_purchase=Decimal("499.99")
        )
        serializer = SellerOrderItemSerializer(order_item)
        data = serializer.data
        self.assertEqual(data["product_title"], "Smartphone")
        self.assertEqual(data["shipping_address"], "123 Street")

    def test_review_serializer_sanitization(self):
        raw_comment = "<script>alert('xss')</script>Great!"
        serializer = ReviewSerializer(data={
            "product": str(self.product.id),
            "rating": 5,
            "comment": raw_comment
        })
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertNotIn("<script>", serializer.validated_data["comment"])
        self.assertIn("&lt;script&gt;", serializer.validated_data["comment"])

    def test_review_serializer_invalid_rating(self):
        serializer = ReviewSerializer(data={
            "product": str(self.product.id),
            "rating": 6, # Max 5
            "comment": "Too high rating"
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn("rating", serializer.errors)
