from django.db import models
from django.conf import settings
import uuid

class Book(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True, null=True)
    year = models.IntegerField(null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    isbn = models.CharField(max_length=13, unique=True, blank=True, null=True)
    
    STATUS_CHOICES = [
        ("active", "Active"),
        ("archived", "Archived"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")

    added_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='books')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title