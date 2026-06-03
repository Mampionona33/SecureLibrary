from rest_framework import viewsets, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import Book
from .serializers import BookSerializer
import os


class BookViewSet(viewsets.ModelViewSet):
    serializer_class = BookSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    # Ajout de JSONParser pour accepter les tests en JSON simple
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    queryset = Book.objects.all().order_by('-created_at')

    def get_queryset(self):
        # 🔒 bibliothèque privée : chaque user voit uniquement ses livres
        return Book.objects.filter(added_by=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(added_by=self.request.user)

    def create(self, request, *args, **kwargs):
        print("RAW DATA:", request.body)
        return super().create(request, *args, **kwargs)


# ✅ Signal défini en dehors de la classe
@receiver(post_delete, sender=Book)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    """
    Supprime automatiquement le PDF et l'image du dossier media 
    lorsque l'objet Book est supprimé.
    """
    # Supprimer le PDF
    if instance.pdf_file and instance.pdf_file.path:
        if os.path.isfile(instance.pdf_file.path):
            os.remove(instance.pdf_file.path)

    # Supprimer l'image
    if instance.cover_image and instance.cover_image.path:
        if os.path.isfile(instance.cover_image.path):
            os.remove(instance.cover_image.path)
