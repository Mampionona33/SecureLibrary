from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, db_index=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
        indexes = [models.Index(fields=['name', 'slug'])]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Category.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Book(models.Model):
    # ============================
    # 1. CHOIX
    # ============================
    STATUS_CHOICES = [
        ("active", "Active"),
        ("archived", "Archived"),
        ("draft", "Draft"),
    ]
    
    LANGUAGE_CHOICES = [
        ('fr', 'Français'),
        ('en', 'English'),
        ('es', 'Español'),
        ('de', 'Deutsch'),
        ('it', 'Italiano'),
        ('pt', 'Português'),
        ('ar', 'العربية'),
        ('zh', '中文'),
        ('ja', '日本語'),
        ('ru', 'Русский'),
    ]

    # ============================
    # 2. IDENTIFIANT
    # ============================
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # ============================
    # 3. INFORMATIONS PRINCIPALES
    # ============================
    title = models.CharField(max_length=255, db_index=True)
    author = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True, null=True)

    # ============================
    # 4. MÉTADONNÉES
    # ============================
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='books'
    )
    year = models.IntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(1000), MaxValueValidator(2100)]
    )
    isbn = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True,
        db_index=True
    )
    
    # 🆕 NOUVEAUX CHAMPS
    publisher = models.CharField(max_length=255, blank=True, null=True)
    pages = models.IntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(1)]
    )
    language = models.CharField(
        max_length=10,
        choices=LANGUAGE_CHOICES,
        default='fr'
    )

    # ============================
    # 5. FICHIERS
    # ============================
    pdf_file = models.FileField(
        upload_to='books/pdfs/%Y/%m/%d/',
        null=True,
        blank=True
    )
    cover_image = models.ImageField(
        upload_to='books/covers/%Y/%m/%d/',
        null=True,
        blank=True
    )

    # ============================
    # 6. STATUT & MÉTRIQUES
    # ============================
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    
    # 🆕 MÉTRIQUES
    views_count = models.PositiveIntegerField(default=0)
    downloads_count = models.PositiveIntegerField(default=0)

    # ============================
    # 7. RELATIONS
    # ============================
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='books'
    )

    # ============================
    # 8. DATES
    # ============================
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)  # 🆕

    # ============================
    # 9. META
    # ============================
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['author']),
            models.Index(fields=['status']),
            models.Index(fields=['category']),
            models.Index(fields=['added_by']),
            models.Index(fields=['-downloads_count']),  # Pour le classement
            models.Index(fields=['-views_count']),
        ]

    # ============================
    # 10. MÉTHODES
    # ============================
    def __str__(self):
        return f"{self.title} - {self.author}"

    def increment_views(self):
        """Incrémenter le compteur de vues"""
        self.views_count += 1
        self.save(update_fields=['views_count'])

    def increment_downloads(self):
        """Incrémenter le compteur de téléchargements"""
        self.downloads_count += 1
        self.save(update_fields=['downloads_count'])
