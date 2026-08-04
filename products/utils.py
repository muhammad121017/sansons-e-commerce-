import os
import threading
from PIL import Image
from django.conf import settings
from django.db import connection  # Required to prevent DB connection leaks
from .models import ProductImage, Product

def process_image(product_image_id):
    """
    Background processing worker that converts raw uploads into
    WebP format and generates three distinct multi-size variants.
    """
    try:
        product_image = ProductImage.objects.get(id=product_image_id)
        product = product_image.product
        
        # ENTERPRISE GUARD 1: Context manager strictly prevents RAM memory leaks
        with Image.open(product_image.original_file.path) as img:
            # Automated Multi-Size Variant Generation
            variants = {
                'thumbnail': (150, 150),
                'catalog_card': (500, 500),
                'high_res_zoom': (1200, 1200)
            }
            
            generated_urls = {}
            base_filename = os.path.splitext(os.path.basename(product_image.original_file.name))[0]
            seller_id = product.seller.id
            product_id = product.id
            
            # Ensure the secure multi-tenant storage bucket exists
            save_dir = os.path.join(settings.MEDIA_ROOT, 'sellers', str(seller_id), 'products', str(product_id), 'processed')
            os.makedirs(save_dir, exist_ok=True)
            
            for variant_name, size in variants.items():
                img_copy = img.copy()
                
                # Strip alpha channels for universal frontend UI compatibility
                if img_copy.mode in ('RGBA', 'P'):
                    img_copy = img_copy.convert('RGB')
                
                img_copy.thumbnail(size)
                
                # Next-Gen Format Conversion: WebP
                webp_filename = f"{base_filename}_{variant_name}.webp"
                webp_filepath = os.path.join(save_dir, webp_filename)
                
                # Save compressed WebP version
                img_copy.save(webp_filepath, 'WEBP', quality=85)
                
                # Construct the final public URL
                media_url_path = f"{settings.MEDIA_URL}sellers/{seller_id}/products/{product_id}/processed/{webp_filename}"
                generated_urls[variant_name] = media_url_path
            
            # Append the new variant dictionary to the Product's JSON field
            current_images = product.images if isinstance(product.images, list) else []
            current_images.append(generated_urls)
            
            product.images = current_images
            product.save()
            
            # Mark raw file as processed
            product_image.is_processed = True
            product_image.save()
            
    except Exception as e:
        print(f"Background worker failed for ProductImage {product_image_id}: {e}")
    finally:
        # ENTERPRISE GUARD 2: Explicitly sever the database connection to prevent PostgreSQL locking
        connection.close()