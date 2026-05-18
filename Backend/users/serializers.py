from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

# 🔹 Serializer pour l'inscription
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        # ⚠️ Ne pas inclure "username" si USERNAME_FIELD = "email"
        # Ne pas inclure status ici, il est géré automatiquement à "pending"
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
        # ⚠️ Promotion automatique si rôle = admin
        if user.role == "admin":
            user.is_staff = True
            user.is_superuser = True
            user.save()
        return user


# 🔹 Serializer pour le login par email
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        # Authentification par email
        user = authenticate(email=email, password=password)
        if not user:
            raise serializers.ValidationError("Email ou mot de passe invalide")

        # SimpleJWT utilise 'username' → on injecte l'email
        attrs["username"] = user.email
        return super().validate(attrs)
