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
            'created_at',
            'updated_at'
        ]
        # ✅ slug en lecture seule – le backend le génère automatiquement
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def get_children(self, obj):
        return CategorySerializer(obj.children.all(), many=True).data


class BookSerializer(serializers.ModelSerializer):
    added_by_email = serializers.ReadOnlyField(source='added_by.email')
    category_detail = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = Book
        fields = [
            'id',
            'title',
            'author',
            'category',
            'category_detail',
            'year',
            'description',
            'isbn',
            'status',
            'pdf_file',
            'cover_image',
            'added_by',
            'added_by_email',
            'created_at'
        ]
        read_only_fields = ['id', 'added_by', 'created_at', 'category_detail']

    def validate_isbn(self, value):
        if value == "":
            return None
        return value
