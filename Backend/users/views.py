from rest_framework import generics
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, EmailTokenObtainPairSerializer
from rest_framework.permissions import IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView

User = get_user_model()

# 🔹 Inscription
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

# 🔹 Suppression (admin only)
class UserDeleteView(generics.DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [IsAdminUser]

# 🔹 Liste des utilisateurs (admin only)
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [IsAdminUser]

# 🔹 Mise à jour (admin only)
class UserUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [IsAdminUser]

# 🔹 Détail (admin only)
class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [IsAdminUser]

# 🔹 Login par email + mot de passe
class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer
