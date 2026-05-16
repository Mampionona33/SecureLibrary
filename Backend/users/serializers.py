from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id","username", "first_name", "last_name", "email", "password", "status", "role"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            status=validated_data.get("status", "active"),
            role=validated_data.get("role", "reader")
        )
        if user.role == "admin":
            user.is_staff = True
            user.is_superuser = True
            user.save()
        return user
