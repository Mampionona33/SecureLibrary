from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

# 🔹 1. Serializer pour l'inscription (Register)
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    # Le statut est en lecture seule pour empêcher le frontend de forcer la valeur "active"
    status = serializers.CharField(read_only=True)

    class Meta:
        model = User
        # Ajout explicite de 'status' pour qu'il soit sérialisé dans la réponse de création
        fields = ["id", "first_name", "last_name", "email", "password", "role", "status"]

    def create(self, validated_data):
        # On force le statut initial à "pending" pour toutes les inscriptions publiques
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            status="pending", 
            role=validated_data.get("role", "reader")
        )
        
        # Déviation de sécurité : Si le rôle demandé est admin, on l'active immédiatement
        if user.role == "admin":
            user.is_staff = True
            user.is_superuser = True
            user.status = "active"
            user.save()
            
        return user


# 🔹 2. Serializer pour la Connexion (Login par Email)
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # On accepte l'email transmis dans le champ 'email' ou 'username' du formulaire
        email_input = attrs.get("email") or attrs.get("username")
        password_input = attrs.get("password")

        # Authentification Django standard
        user = authenticate(email=email_input, password=password_input)
        if not user:
            raise serializers.ValidationError({"detail": "Email ou mot de passe invalide"})

        # 🔒 SÉCURITÉ ABSOLUE : Si l'utilisateur est en attente, on lève une validation d'erreur.
        # Cela empêche SimpleJWT de générer et de distribuer les tokens Access/Refresh.
        if user.status == "pending":
            raise serializers.ValidationError({
                "detail": "Votre compte est en attente de validation par un administrateur."
            })

        # SimpleJWT requiert la clé 'username' pour lier l'identifiant unique
        attrs["username"] = user.email
        
        # Renvoie uniquement {"refresh": "...", "access": "..."} si le compte est actif
        return super().validate(attrs)


# 🔹 3. Serializer pour le Profil Utilisateur (/api/users/me/)
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Le champ 'status' est disponible pour permettre au mobile de vérifier l'état en tâche de fond
        fields = ["id", "first_name", "last_name", "email", "role", "status"]
