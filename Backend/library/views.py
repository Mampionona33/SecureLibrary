from rest_framework import viewsets, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import Book, Category
from .serializers import BookSerializer, CategorySerializer
import os


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    queryset = Category.objects.all().order_by('name')


class BookViewSet(viewsets.ModelViewSet):
    serializer_class = BookSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    queryset = Book.objects.all().order_by('-created_at')

    def get_queryset(self):
        return Book.objects.filter(added_by=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(added_by=self.request.user)

    def create(self, request, *args, **kwargs):
        print("PARSED DATA:", request.data)
        return super().create(request, *args, **kwargs)


@receiver(post_delete, sender=Book)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    if instance.pdf_file and instance.pdf_file.path:
        if os.path.isfile(instance.pdf_file.path):
            os.remove(instance.pdf_file.path)
    if instance.cover_image and instance.cover_image.path:
        if os.path.isfile(instance.cover_image.path):
            os.remove(instance.cover_image.path)
