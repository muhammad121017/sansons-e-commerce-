from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from datetime import timedelta
import logging
from products.models import Order, Product

logger = logging.getLogger('audit_logger')

class Command(BaseCommand):
    help = 'Automatically restocks items from unpaid orders older than 15 minutes.'

    def handle(self, *args, **options):
        threshold_time = timezone.now() - timedelta(minutes=15)
        expired_orders = Order.objects.filter(
            payment_status='unpaid',
            order_status='pending',
            created_at__lt=threshold_time
        )

        count = expired_orders.count()
        if count == 0:
            self.stdout.write("No expired unpaid orders found.")
            return

        for order in expired_orders:
            with transaction.atomic():
                locked_order = Order.objects.select_for_update().get(id=order.id)
                if locked_order.order_status == 'pending' and locked_order.payment_status == 'unpaid':
                    locked_order.order_status = 'cancelled'
                    locked_order.save()

                    for item in locked_order.items.select_related('product'):
                        if item.product:
                            product = Product.objects.select_for_update().get(id=item.product.id)
                            product.stock_quantity += item.quantity
                            product.save()
                            logger.info(f"Inventory Restocked: {item.quantity} units returned to product {product.id} (Order {locked_order.id})")
                            self.stdout.write(f"Restocked {item.quantity} units of {product.title} from Order {locked_order.id}")

        self.stdout.write(self.style.SUCCESS(f"Successfully processed {count} expired orders."))
