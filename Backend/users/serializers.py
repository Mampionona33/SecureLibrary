from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email", "password", "role", "status"]

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            status="pending", 
            role=validated_data.get("role", "reader")
        )
        
        if user.role == "admin":
            user.is_staff = True
            user.is_superuser = True
            user.status = "active"
            user.save()
            
        return user

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        email_input = attrs.get("email") or attrs.get("username")
        password_input = attrs.get("password")

        user = authenticate(email=email_input, password=password_input)
        if not user:
            raise serializers.ValidationError({"detail": "Email ou mot de passe invalide"})

        attrs["username"] = user.email
        data = super().validate(attrs)

        data["user"] = {
            "email": user.email,
            "status": user.status
        }
        
        return data

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email", "role", "status"]
