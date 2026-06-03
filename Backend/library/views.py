from rest_framework import viewsets, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Book
from .serializers import BookSerializer


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