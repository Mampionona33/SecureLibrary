from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import (
    RegisterSerializer, 
    EmailTokenObtainPairSerializer, 
    UserProfileSerializer
)

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
    serializer_class = RegisterSerializer
    permission_classes = [IsAdminUser]

class UserUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [IsAdminUser]

class UserDetailView(generics.RetrieveAPIView):
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
