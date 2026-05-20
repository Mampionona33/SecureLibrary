from rest_framework import serializers
from django.core.files.base import ContentFile
from .utils import encrypt_data
from .models import Book

class BookSerializer(serializers.ModelSerializer):
    added_by_email = serializers.ReadOnlyField(source='added_by.email')

    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'category', 'year', 'description', 'isbn', 'status', 'pdf_file', 'cover_image', 'added_by', 'added_by_email', 'created_at']
        read_only_fields = ['id', 'added_by', 'created_at']

    def encrypt_pdf(self, validated_data):
        pdf = validated_data.get('pdf_file')
        if pdf and not getattr(pdf, '_encrypted', False):
            content = pdf.read()
            encrypted_content = encrypt_data(content)
            # On remplace le fichier par sa version cryptée
            filename = pdf.name
            validated_data['pdf_file'] = ContentFile(encrypted_content, name=filename)
            validated_data['pdf_file']._encrypted = True
        return validated_data

    def create(self, validated_data):
        validated_data = self.encrypt_pdf(validated_data)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data = self.encrypt_pdf(validated_data)
        return super().update(instance, validated_data)