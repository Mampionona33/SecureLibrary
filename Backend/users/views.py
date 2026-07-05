from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView

# Importation de tes serializers (on ajoute UserProfileSerializer)
from .serializers import (
    RegisterSerializer, 
    EmailTokenObtainPairSerializer, 
    UserProfileSerializer
)

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

# 🔹 Login par email + mot de passe (Renvoie uniquement les tokens)
class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

# 🔹 NOUVEAU : Profil de l'utilisateur connecté (Who Am I)
class CurrentUserView(APIView):
    # Sécurité : Seul un utilisateur avec un Token "access" valide peut exécuter cette requête
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # request.user est automatiquement récupéré par SimpleJWT grâce au Token fourni par le client
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
