from rest_framework import serializers
from .models import Book


class BookSerializer(serializers.ModelSerializer):
    added_by_email = serializers.ReadOnlyField(source='added_by.email')

    class Meta:
        model = Book
        fields = [
            'id',
            'title',
            'author',
            'category',
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
        read_only_fields = ['id', 'added_by', 'created_at']

    def validate_isbn(self, value):
        # permet d'éviter les "" envoyés par le front
        if value == "":
            return None
        return value