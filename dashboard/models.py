from django.db import models
from django.conf import settings
import uuid


class SiteCMS(models.Model):
    id = models.CharField(primary_key=True, max_length=50, default='default')
    homepage_sections = models.JSONField(default=list, blank=True)
    hero_slides = models.JSONField(default=list, blank=True)
    announcement_bar = models.JSONField(default=dict, blank=True)
    brand_story = models.JSONField(default=dict, blank=True)
    faq_items = models.JSONField(default=list, blank=True)
    featured_categories = models.JSONField(default=list, blank=True)
    featured_products = models.JSONField(default=list, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Site CMS Content Configuration"

class SiteSettings(models.Model):
    id = models.CharField(primary_key=True, max_length=50, default='default')
    store_name = models.CharField(max_length=255, default='Sansons')
    support_email = models.EmailField(default='concierge@sansons.com')
    currency = models.CharField(max_length=10, default='PKR')

    free_shipping_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=150.00)
    flat_shipping_rate = models.DecimalField(max_digits=10, decimal_places=2, default=12.00)
    cod_enabled = models.BooleanField(default=True)
    maintenance_mode = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Global Site Settings ({self.store_name})"

class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    user_email = models.CharField(max_length=255)
    user_role = models.CharField(max_length=50, default='admin')
    action = models.CharField(max_length=255)
    details = models.TextField()
    module = models.CharField(max_length=50, default='General')
    ip_address = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.created_at.strftime('%Y-%m-%d %H:%M')} | {self.user_email} | {self.action}"


def log_audit_action(user, action, details, module='General', request=None):
    try:
        ip = None
        if request:
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0].strip()
            else:
                ip = request.META.get('REMOTE_ADDR')

        user_email = user.email if (user and user.is_authenticated) else 'System'
        user_role = getattr(user, 'role', 'admin') if (user and user.is_authenticated) else 'system'

        AuditLog.objects.create(
            user=user if (user and user.is_authenticated) else None,
            user_email=user_email,
            user_role=user_role,
            action=action,
            details=details,
            module=module,
            ip_address=ip
        )
    except Exception as e:
        print(f"Failed to record audit log: {e}")


class VisitorActivity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    user_email = models.CharField(max_length=255, null=True, blank=True)
    session_id = models.CharField(max_length=255, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    page_url = models.CharField(max_length=500, null=True, blank=True)
    action = models.CharField(max_length=255, default='page_view')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.created_at.strftime('%Y-%m-%d %H:%M')} | {self.user_email or 'Guest'} | {self.page_url}"

