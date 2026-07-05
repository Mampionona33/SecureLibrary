from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

# 🔹 Serializer pour l'inscription (inchangé)
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email", "password", "role"]

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            status=validated_data.get("status", "pending"),
            role=validated_data.get("role", "reader")
        )
        if user.role == "admin":
            user.is_staff = True
            user.is_superuser = True
            user.save()
        return user


# 🔹 Serializer pour le login par email (ÉPURÉ - APPROCHE A)
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    # On laisse SimpleJWT gérer dynamiquement le dictionnaire d'attributs
    def validate(self, attrs):
        # On accepte 'email' ou 'username' venant du frontend
        email_input = attrs.get("email") or attrs.get("username")
        password_input = attrs.get("password")

        user = authenticate(email=email_input, password=password_input)
        if not user:
            raise serializers.ValidationError({"detail": "Email ou mot de passe invalide"})

        # SimpleJWT se base sur le champ d'identification unique
        attrs["username"] = user.email
        
        # Retourne UNIQUEMENT {"refresh": "...", "access": "..."}
        return super().validate(attrs)

# 🔹 NOUVEAU : Serializer pour renvoyer le profil sur l'endpoint /me/
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email", "role"]
