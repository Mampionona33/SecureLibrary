from rest_framework import generics, viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from .models import Group
from .serializers import (
    RegisterSerializer, 
    EmailTokenObtainPairSerializer, 
    UserProfileSerializer,
    GroupSerializer,
    CustomTokenRefreshSerializer
)
import logging

logger = logging.getLogger(__name__)

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

class UserDeleteView(generics.DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [IsAdminUser]

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdminUser]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [IsAdminUser]

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response({"user": serializer.data})

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all().order_by('-created_at')
    serializer_class = GroupSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer

# ==============================================
# NOUVEAU : LogoutView pour blacklist des tokens
# ==============================================
class LogoutView(APIView):
    """
    Vue pour la déconnexion avec blacklist du refresh token.
    Nécessite d'être authentifié.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Récupérer le refresh token du body de la requête
            refresh_token = request.data.get('refresh')
            
            if not refresh_token:
                return Response(
                    {'error': 'Le refresh token est requis'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Blacklister le refresh token
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
                
                logger.info(f"✅ Token blacklisté avec succès pour l'utilisateur {request.user.email}")
                return Response(
                    {'detail': 'Déconnecté avec succès'},
                    status=status.HTTP_200_OK
                )
                
            except TokenError as e:
                logger.warning(f"⚠️ Tentative de blacklist d'un token invalide: {str(e)}")
                return Response(
                    {'error': 'Token invalide ou déjà expiré'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            logger.error(f"❌ Erreur lors de la déconnexion: {str(e)}")
            return Response(
                {'error': 'Une erreur est survenue lors de la déconnexion'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
