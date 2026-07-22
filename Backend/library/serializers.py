from rest_framework import serializers
from .models import Book, Category
import base64
from django.core.files.base import ContentFile


# 1. D'abord définir CategorySerializer
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


# 2. Ensuite définir BookSerializer
class BookSerializer(serializers.ModelSerializer):
    added_by_email = serializers.ReadOnlyField(source='added_by.email')
    added_by_name = serializers.ReadOnlyField(source='added_by.get_full_name')
    category_detail = CategorySerializer(source='category', read_only=True)
    
    # ✅ Champs calculés
    pdf_url = serializers.SerializerMethodField()
    cover_url = serializers.SerializerMethodField()
    is_popular = serializers.SerializerMethodField()
    
    # 🆕 Champs pour recevoir les fichiers en base64 (write-only)
    pdf_file_encrypted = serializers.CharField(write_only=True, required=False, allow_blank=True)
    cover_image_base64 = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Book
        fields = [
            'id',
            'title',
            'author',
            'description',
            'category',
            'category_detail',
            'year',
            'isbn',
            'publisher',
            'pages',
            'language',
            'pdf_file',
            'pdf_file_encrypted',
            'pdf_url',
            'cover_image',
            'cover_image_base64',
            'cover_url',
            'status',
            'views_count',
            'downloads_count',
            'is_popular',
            'added_by',
            'added_by_email',
            'added_by_name',
            'created_at',
            'updated_at',
            'published_at',
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
        return data

    def create(self, validated_data):
        """Créer un livre avec gestion du PDF et de l'image en base64"""
        # Extraire les champs base64
        pdf_base64 = validated_data.pop('pdf_file_encrypted', None)
        cover_base64 = validated_data.pop('cover_image_base64', None)
        
        # Si on a un PDF en base64, le convertir en fichier
        if pdf_base64:
            try:
                pdf_data = base64.b64decode(pdf_base64)
                pdf_file = ContentFile(pdf_data, name='book.pdf')
                validated_data['pdf_file'] = pdf_file
            except Exception as e:
                raise serializers.ValidationError({
                    'pdf_file_encrypted': f'Erreur lors du décodage du PDF: {str(e)}'
                })
        
        # Si on a une image en base64, la convertir en fichier
        if cover_base64:
            try:
                cover_data = base64.b64decode(cover_base64)
                cover_file = ContentFile(cover_data, name='cover.jpg')
                validated_data['cover_image'] = cover_file
            except Exception as e:
                raise serializers.ValidationError({
                    'cover_image_base64': f'Erreur lors du décodage de l\'image: {str(e)}'
                })
        
        # Créer le livre
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Mettre à jour un livre avec gestion du PDF et de l'image en base64"""
        pdf_base64 = validated_data.pop('pdf_file_encrypted', None)
        cover_base64 = validated_data.pop('cover_image_base64', None)
        
        if pdf_base64:
            try:
                pdf_data = base64.b64decode(pdf_base64)
                pdf_file = ContentFile(pdf_data, name='book.pdf')
                validated_data['pdf_file'] = pdf_file
            except Exception as e:
                raise serializers.ValidationError({
                    'pdf_file_encrypted': f'Erreur lors du décodage du PDF: {str(e)}'
                })
        
        if cover_base64:
            try:
                cover_data = base64.b64decode(cover_base64)
                cover_file = ContentFile(cover_data, name='cover.jpg')
                validated_data['cover_image'] = cover_file
            except Exception as e:
                raise serializers.ValidationError({
                    'cover_image_base64': f'Erreur lors du décodage de l\'image: {str(e)}'
                })
        
        return super().update(instance, validated_data)


# 3. Ensuite BookListSerializer et BookPopularSerializer
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
