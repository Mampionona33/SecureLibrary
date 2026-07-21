from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.db import IntegrityError
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Gestionnaire d'exceptions personnalisé pour l'API
    """
    # Appeler le handler par défaut de DRF
    response = exception_handler(exc, context)

    # Log de l'erreur
    logger.error(f"Exception: {exc}")
    logger.error(f"Context: {context}")

    # Gestion des erreurs personnalisées
    if isinstance(exc, ValidationError):
        return Response(
            {
                'error': 'Validation error',
                'details': exc.message_dict if hasattr(exc, 'message_dict') else str(exc)
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if isinstance(exc, IntegrityError):
        return Response(
            {
                'error': 'Database integrity error',
                'details': str(exc)
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # Si DRF a déjà une réponse
    if response is not None:
        # Ajouter un message plus explicite
        if isinstance(response.data, dict):
            response.data['message'] = 'Une erreur est survenue'

        # Gérer les erreurs d'authentification JWT
        if response.status_code == status.HTTP_401_UNAUTHORIZED:
            response.data['message'] = 'Veuillez vous connecter pour accéder à cette ressource'
        
        if response.status_code == status.HTTP_403_FORBIDDEN:
            response.data['message'] = 'Vous n\'avez pas la permission d\'accéder à cette ressource'

        return response

    # Erreurs non gérées
    return Response(
        {
            'error': 'Internal server error',
            'details': str(exc) if __debug__ else 'Une erreur est survenue'
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
