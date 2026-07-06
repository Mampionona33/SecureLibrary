from django.contrib.auth.models import BaseUserManager, AbstractUser
from django.db import models
import uuid

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'email est obligatoire")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser doit avoir is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser doit avoir is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class Group(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class CustomUser(AbstractUser):
    username = None
    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    STATUS_CHOICES = [
        ("active", "Active"),
        ("inactive", "Inactive"),
        ("pending", "Pending"),
        ("suspended", "Suspended"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")

    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("staff", "Staff"),
        ("reader", "Reader"),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="reader")

    groups_list = models.ManyToManyField(Group, related_name="members", blank=True)

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.email} ({self.role}, {self.status})"
