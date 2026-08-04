from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from products.models import Category, Product, Review
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with premium mock categories, products, sellers, and reviews.'

    def handle(self, *args, **options):
        self.stdout.write("Starting database seeding...")

        # 1. Create Sellers and Purchasers
        seller, created = User.objects.get_or_create(
            email='seller@sansons.com',
            defaults={
                'first_name': 'Sarah',
                'last_name': 'Vendor',
                'role': 'seller',
                'status': 'active',
                'is_staff': False
            }
        )
        if created:
            seller.set_password('mady1122')
            seller.save()
            self.stdout.write("Created seller account: seller@sansons.com")
        else:
            self.stdout.write("Seller account already exists.")

        purchaser, created = User.objects.get_or_create(
            email='purchaser@sansons.com',
            defaults={
                'first_name': 'John',
                'last_name': 'Shopper',
                'role': 'purchaser',
                'status': 'active',
                'is_staff': False
            }
        )
        if created:
            purchaser.set_password('mady1122')
            purchaser.save()
            self.stdout.write("Created purchaser account: purchaser@sansons.com")

        # 2. Create Categories
        categories_data = [
            {'name': 'Electronics', 'slug': 'electronics'},
            {'name': 'Fashion & Apparel', 'slug': 'fashion-apparel'},
            {'name': 'Home & Living', 'slug': 'home-living'},
            {'name': 'Sports & Outdoors', 'slug': 'sports-outdoors'},
        ]
        
        categories = {}
        for cat in categories_data:
            c, created = Category.objects.get_or_create(
                slug=cat['slug'],
                defaults={'name': cat['name']}
            )
            categories[cat['slug']] = c
            if created:
                self.stdout.write(f"Created category: {cat['name']}")

        # 3. Create Products
        products_data = [
            {
                'title': 'Ultra-Premium Noise-Cancelling Headphones',
                'slug': 'ultra-premium-headphones',
                'description': 'Experience studio-quality sound with active hybrid noise cancellation, 40-hour battery life, and plush memory foam earcups.',
                'price': 299.99,
                'sku': 'EL-HD-001',
                'stock_quantity': 25,
                'category': categories['electronics'],
                'attributes': {'color': 'Midnight Black', 'connectivity': 'Bluetooth 5.2', 'battery_life': '40 Hours'},
                'images': [
                    {
                        'thumbnail': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop',
                        'catalog_card': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
                        'high_res_zoom': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=1200&fit=crop'
                    }
                ]
            },
            {
                'title': 'Pro Mechanical RGB Gaming Keyboard',
                'slug': 'pro-gaming-keyboard',
                'description': 'Speed-optimized mechanical switches, customizable per-key RGB backlighting, and an aluminum chassis for premium durability.',
                'price': 129.99,
                'sku': 'EL-KB-002',
                'stock_quantity': 15,
                'category': categories['electronics'],
                'attributes': {'color': 'RGB Charcoal', 'switch_type': 'Linear Cherry MX Red', 'layout': 'Tenkeyless'},
                'images': [
                    {
                        'thumbnail': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=150&h=150&fit=crop',
                        'catalog_card': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop',
                        'high_res_zoom': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&h=1200&fit=crop'
                    }
                ]
            },
            {
                'title': 'Minimalist Classic Leather Watch',
                'slug': 'minimalist-leather-watch',
                'description': 'Elegant minimalist watch with a genuine Italian brown leather strap, scratch-resistant sapphire crystal glass, and water resistance up to 50m.',
                'price': 189.50,
                'sku': 'FA-WT-003',
                'stock_quantity': 8,
                'category': categories['fashion-apparel'],
                'attributes': {'color': 'Rose Gold & Brown', 'strap_material': 'Genuine Leather', 'dial_size': '40mm'},
                'images': [
                    {
                        'thumbnail': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&fit=crop',
                        'catalog_card': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
                        'high_res_zoom': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=1200&fit=crop'
                    }
                ]
            },
            {
                'title': 'Ergonomic Performance Running Shoes',
                'slug': 'ergonomic-running-shoes',
                'description': 'Engineered with responsive foam cushioning, breathable knit upper, and high-traction rubber outsoles for peak performance.',
                'price': 110.00,
                'sku': 'FA-SH-004',
                'stock_quantity': 3,  # Sets off low stock alert
                'category': categories['fashion-apparel'],
                'attributes': {'color': 'Arctic White', 'size': '10', 'type': 'Running'},
                'images': [
                    {
                        'thumbnail': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&h=150&fit=crop',
                        'catalog_card': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
                        'high_res_zoom': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=1200&fit=crop'
                    }
                ]
            },
            {
                'title': 'Smart LED Ambient Floor Lamp',
                'slug': 'smart-led-floor-lamp',
                'description': 'Sleek, minimalist corner lamp with 16 million colors, app controls, music sync mode, and smart home voice assistant integrations.',
                'price': 89.99,
                'sku': 'HL-LP-005',
                'stock_quantity': 40,
                'category': categories['home-living'],
                'attributes': {'color': 'Satin Black', 'height': '140cm', 'connectivity': 'Wi-Fi + Bluetooth'},
                'images': [
                    {
                        'thumbnail': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=150&h=150&fit=crop',
                        'catalog_card': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop',
                        'high_res_zoom': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&h=1200&fit=crop'
                    }
                ]
            }
        ]

        for p_data in products_data:
            p, created = Product.objects.get_or_create(
                slug=p_data['slug'],
                defaults={
                    'title': p_data['title'],
                    'description': p_data['description'],
                    'price': p_data['price'],
                    'sku': p_data['sku'],
                    'stock_quantity': p_data['stock_quantity'],
                    'category': p_data['category'],
                    'attributes': p_data['attributes'],
                    'images': p_data['images'],
                    'seller': seller,
                    'is_published': True
                }
            )
            if created:
                self.stdout.write(f"Created product: {p_data['title']}")
                # Add a review for this product
                Review.objects.create(
                    product=p,
                    purchaser=purchaser,
                    rating=5 if p.price > 150 else 4,
                    comment="Excellent quality product, works exactly as described and shipped super fast!",
                    is_approved=True
                )
                self.stdout.write(f"Added approved review for product: {p_data['title']}")

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
