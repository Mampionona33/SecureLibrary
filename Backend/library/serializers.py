from rest_framework import serializers
from .models import Book, Category


class CategorySerializer(serializers.ModelSerializer):
    parent_id = serializers.PrimaryKeyRelatedField(
        source='parent',
        queryset=Category.objects.all(),
        allow_null=True,
        required=False,
        write_only=True
    )
    children = serializers.SerializerMethodField(read_only=True)
    books_count = serializers.IntegerField(source='books.count', read_only=True)

    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'parent',
            'parent_id',
            'children',
            'books_count',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'books_count']

    def get_children(self, obj):
        return CategorySerializer(obj.children.all(), many=True).data


class BookSerializer(serializers.ModelSerializer):
    added_by_email = serializers.ReadOnlyField(source='added_by.email')
    added_by_name = serializers.ReadOnlyField(source='added_by.get_full_name')
    category_detail = CategorySerializer(source='category', read_only=True)
    
    # ✅ Champs calculés
    pdf_url = serializers.SerializerMethodField()
    cover_url = serializers.SerializerMethodField()
    is_popular = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            # Identifiant
            'id',
            
            # Informations principales
            'title',
            'author',
            'description',
            
            # Métadonnées
            'category',
            'category_detail',
            'year',
            'isbn',
            'publisher',      # 🆕
            'pages',          # 🆕
            'language',       # 🆕
            
            # Fichiers
            'pdf_file',
            'pdf_url',        # 🆕
            'cover_image',
            'cover_url',      # 🆕
            
            # Statut et métriques
            'status',
            'views_count',    # 🆕
            'downloads_count', # 🆕
            'is_popular',     # 🆕
            
            # Relations
            'added_by',
            'added_by_email',
            'added_by_name',
            
            # Dates
            'created_at',
            'updated_at',
            'published_at',   # 🆕
        ]
        read_only_fields = [
            'id', 
            'added_by', 
            'created_at', 
            'updated_at',
            'views_count',
            'downloads_count',
            'category_detail',
            'added_by_email',
            'added_by_name',
            'pdf_url',
            'cover_url',
            'is_popular'
        ]
        extra_kwargs = {
            'publisher': {'required': False, 'allow_null': True},
            'pages': {'required': False, 'allow_null': True},
            'language': {'required': False, 'allow_blank': True},
            'year': {'required': False, 'allow_null': True},
            'isbn': {'required': False, 'allow_null': True},
            'description': {'required': False, 'allow_blank': True},
            'pdf_file': {'required': False, 'allow_null': True},
            'cover_image': {'required': False, 'allow_null': True},
            'status': {'required': False, 'allow_blank': True},
            'published_at': {'required': False, 'allow_null': True},
        }

    def get_pdf_url(self, obj):
        """Retourner l'URL du PDF"""
        if obj.pdf_file:
            try:
                return obj.pdf_file.url
            except ValueError:
                return None
        return None

    def get_cover_url(self, obj):
        """Retourner l'URL de l'image"""
        if obj.cover_image:
            try:
                return obj.cover_image.url
            except ValueError:
                return None
        return None

    def get_is_popular(self, obj):
        """Vérifier si le livre est populaire (> 50 téléchargements)"""
        return obj.downloads_count > 50

    def validate_isbn(self, value):
        """Valider l'ISBN - accepter vide ou null"""
        if value == "":
            return None
        return value

    def validate_year(self, value):
        """Valider l'année"""
        if value and (value < 1000 or value > 2100):
            raise serializers.ValidationError("L'année doit être entre 1000 et 2100")
        return value

    def validate_pages(self, value):
        """Valider le nombre de pages"""
        if value and value < 1:
            raise serializers.ValidationError("Le nombre de pages doit être >= 1")
        return value

    def validate_language(self, value):
        """Valider la langue"""
        valid_languages = ['fr', 'en', 'es', 'de', 'it', 'pt', 'ar', 'zh', 'ja', 'ru']
        if value and value not in valid_languages:
            raise serializers.ValidationError(f"Langue invalide. Choix: {', '.join(valid_languages)}")
        return value

    def validate(self, data):
        """Validation croisée"""
        # Si status est 'active', published_at doit être défini
        if data.get('status') == 'active' and not data.get('published_at'):
            # Optionnel : définir automatiquement
            # from django.utils import timezone
            # data['published_at'] = timezone.now()
            pass
        return data


class BookListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Book
        fields = [
            'id',
            'title',
            'author',
            'category_name',
            'status',
            'language',
            'views_count',
            'downloads_count',
            'created_at',
            'cover_image',
        ]


class BookPopularSerializer(serializers.ModelSerializer):
    """Serializer pour les livres populaires"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    download_count = serializers.IntegerField(source='downloads_count', read_only=True)
    
    class Meta:
        model = Book
        fields = [
            'id',
            'title',
            'author',
            'category_name',
            'download_count',
            'cover_image',
        ]
