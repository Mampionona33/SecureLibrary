from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # 🔹 Status (état du compte)
    STATUS_CHOICES = [
        ("active", "Active"),
        ("inactive", "Inactive"),
        ("pending", "Pending"),
        ("suspended", "Suspended"),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active"
    )

    # 🔹 Role (type d’utilisateur)
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("librarian", "Librarian"),
        ("reader", "Reader"),
    ]
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="reader"
    )
    

    def __str__(self):
        return f"{self.username} ({self.role}, {self.status})"
