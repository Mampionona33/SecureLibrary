from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Group

User = get_user_model()

class GroupSerializer(serializers.ModelSerializer):
    member_count = serializers.IntegerField(source='members.count', read_only=True)

    class Meta:
        model = Group
        fields = ["id", "name", "description", "member_count", "created_at"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    status = serializers.CharField(required=False)
    firstName = serializers.CharField(source='first_name', allow_blank=True, default="")
    lastName = serializers.CharField(source='last_name', allow_blank=True, default="")
    groups_list = GroupSerializer(many=True, read_only=True)
    group_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Group.objects.all(), required=False
    )

    class Meta:
        model = User
        fields = ["id", "firstName", "lastName", "email", "password", "role", "status", "groups_list", "group_ids"]

    def create(self, validated_data):
        group_ids = validated_data.pop('group_ids', [])
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
            
        if group_ids:
            user.groups_list.set(group_ids)
        return user

    def update(self, instance, validated_data):
        group_ids = validated_data.pop('group_ids', None)
        
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.role = validated_data.get('role', instance.role)
        instance.status = validated_data.get('status', instance.status)

        if instance.role == "admin":
            instance.is_staff = True
            instance.is_superuser = True
        elif instance.role == "staff":
            instance.is_staff = True
            instance.is_superuser = False
        else:
            instance.is_staff = False
            instance.is_superuser = False

        instance.save()

        if group_ids is not None:
            instance.groups_list.set(group_ids)
            
        return instance


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
    firstName = serializers.CharField(source='first_name')
    lastName = serializers.CharField(source='last_name')
    groups_list = GroupSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ["id", "firstName", "lastName", "email", "role", "status", "groups_list"]


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        refresh = RefreshToken(attrs["refresh"])
        user_id = refresh.payload.get("user_id")

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise serializers.ValidationError({"detail": "Utilisateur introuvable"})

        if user.status != "active":
            raise serializers.ValidationError({"detail": "Compte non actif ou suspendu"})

        return super().validate(attrs)
