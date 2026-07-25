from rest_framework import viewsets, permissions, status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from django.db.models import Q
from django.utils import timezone
from .models import Book, Category
from .serializers import (
    BookSerializer, 
    CategorySerializer,
    BookListSerializer,
    BookPopularSerializer
)
import os
import logging

logger = logging.getLogger(__name__)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des catégories
    """
    serializer_class = CategorySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    queryset = Category.objects.all().order_by('name')

    def get_queryset(self):
        """Filtrer les catégories"""
        queryset = super().get_queryset()
        
        # Recherche par nom
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        # Filtrer par parent
        parent_id = self.request.query_params.get('parent', None)
        if parent_id:
            queryset = queryset.filter(parent_id=parent_id)
        elif parent_id == 'null':
            queryset = queryset.filter(parent__isnull=True)
        
        return queryset


class BookViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des livres
    """
    serializer_class = BookSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        """
        Filtrer les livres par utilisateur avec recherche et filtres
        """
        queryset = Book.objects.filter(added_by=self.request.user)
        params = self.request.query_params
        
        # 🔍 Recherche
        search = params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(author__icontains=search) |
                Q(publisher__icontains=search) |
                Q(isbn__icontains=search)
            )
        
        # 📂 Filtrer par catégorie (UUID)
        category = params.get('category', None)
        if category:
            queryset = queryset.filter(category_id=category)
        
        # 📊 Filtrer par statut
        status_filter = params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # 🌐 Filtrer par langue
        language = params.get('language', None)
        if language:
            queryset = queryset.filter(language=language)
        
        # 📅 Filtrer par année
        year = params.get('year', None)
        if year:
            try:
                queryset = queryset.filter(year=int(year))
            except ValueError:
                pass
        
        # 📄 Filtrer par présence de PDF
        has_pdf = params.get('has_pdf', None)
        if has_pdf == 'true':
            queryset = queryset.exclude(pdf_file__isnull=True)
        elif has_pdf == 'false':
            queryset = queryset.filter(pdf_file__isnull=True)
        
        # 🖼️ Filtrer par présence d'image
        has_cover = params.get('has_cover', None)
        if has_cover == 'true':
            queryset = queryset.exclude(cover_image__isnull=True)
        elif has_cover == 'false':
            queryset = queryset.filter(cover_image__isnull=True)
        
        # 📊 Filtrer par popularité (téléchargements > seuil)
        min_downloads = params.get('min_downloads', None)
        if min_downloads:
            try:
                queryset = queryset.filter(downloads_count__gte=int(min_downloads))
            except ValueError:
                pass
        
        # 📅 Filtrer par date de création (après une date)
        created_after = params.get('created_after', None)
        if created_after:
            try:
                queryset = queryset.filter(created_at__gte=created_after)
            except ValueError:
                pass
        
        # 🏷️ Filtrer par ISBN
        isbn = params.get('isbn', None)
        if isbn:
            queryset = queryset.filter(isbn__icontains=isbn)
        
        # 📊 Filtrer par auteur exact
        author_exact = params.get('author_exact', None)
        if author_exact:
            queryset = queryset.filter(author__iexact=author_exact)
        
        # 🔄 Tri
        ordering = params.get('ordering', None)
        if ordering:
            # Vérifier que le champ de tri est valide
            valid_order_fields = [
                'title', '-title', 'author', '-author',
                'year', '-year', 'created_at', '-created_at',
                'updated_at', '-updated_at',
                'views_count', '-views_count',
                'downloads_count', '-downloads_count',
                'status', '-status'
            ]
            if ordering in valid_order_fields:
                queryset = queryset.order_by(ordering)
        else:
            # Tri par défaut: plus récent d'abord
            queryset = queryset.order_by('-created_at')
        
        return queryset

    def get_serializer_class(self):
        """Utiliser un serializer différent pour les listes"""
        if self.action == 'list':
            return BookListSerializer
        elif self.action == 'popular':
            return BookPopularSerializer
        return BookSerializer

    def perform_create(self, serializer):
        """Créer un livre avec l'utilisateur connecté"""
        serializer.save(added_by=self.request.user)
        logger.info(f"📚 Livre créé: {serializer.instance.title} par {self.request.user.email}")

    def perform_update(self, serializer):
        """Mettre à jour un livre"""
        old_title = serializer.instance.title
        serializer.save()
        logger.info(f"📚 Livre mis à jour: {old_title} -> {serializer.instance.title}")

    def perform_destroy(self, instance):
        """Supprimer un livre (les fichiers sont supprimés par le signal)"""
        title = instance.title
        instance.delete()
        logger.info(f"🗑️ Livre supprimé: {title}")

    def create(self, request, *args, **kwargs):
        """Créer un livre avec logs"""
        logger.info(f"📝 Création livre - Données: {request.data.keys()}")
        logger.info(f"📎 Fichiers reçus: {list(request.FILES.keys())}")
        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        """Incrémenter le compteur de vues"""
        book = self.get_object()
        book.increment_views()
        return Response({
            'id': book.id,
            'views_count': book.views_count
        })

    @action(detail=True, methods=['post'])
    def increment_downloads(self, request, pk=None):
        """Incrémenter le compteur de téléchargements"""
        book = self.get_object()
        book.increment_downloads()
        return Response({
            'id': book.id,
            'downloads_count': book.downloads_count
        })

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Top 10 des livres les plus populaires"""
        books = self.get_queryset().filter(status='active').order_by('-downloads_count')[:10]
        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Statistiques des livres"""
        books = self.get_queryset()
        
        stats = {
            'total': books.count(),
            'active': books.filter(status='active').count(),
            'archived': books.filter(status='archived').count(),
            'draft': books.filter(status='draft').count(),
            'with_pdf': books.exclude(pdf_file__isnull=True).count(),
            'with_cover': books.exclude(cover_image__isnull=True).count(),
            'total_downloads': books.aggregate(total=models.Sum('downloads_count'))['total'] or 0,
            'total_views': books.aggregate(total=models.Sum('views_count'))['total'] or 0,
            'languages': books.values('language').annotate(count=models.Count('id')),
        }
        return Response(stats)

    @action(detail=True, methods=['get'])
    def download_pdf(self, request, pk=None):
        """Télécharger le PDF d'un livre"""
        book = self.get_object()
        
        if not book.pdf_file:
            return Response(
                {'error': 'Ce livre n\'a pas de PDF associé'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Incrémenter le compteur
        book.increment_downloads()
        
        # Vérifier que le fichier existe
        if not book.pdf_file.storage.exists(book.pdf_file.name):
            return Response(
                {'error': 'Fichier PDF introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Créer la réponse
        from django.http import FileResponse
        response = FileResponse(
            book.pdf_file.open('rb'),
            content_type='application/pdf',
            filename=f"{book.title.replace(' ', '_')}.pdf"
        )
        response['Content-Disposition'] = f'attachment; filename="{book.title.replace(" ", "_")}.pdf"'
        return response


# ============================================================
# SIGNALS POUR LA SUPPRESSION DES FICHIERS
# ============================================================

@receiver(post_delete, sender=Book)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    """
    Supprimer les fichiers physiques quand un livre est supprimé
    """
    try:
        if instance.pdf_file:
            instance.pdf_file.delete(save=False)
            logger.info(f"🗑️ PDF supprimé: {instance.pdf_file.name}")
    except Exception as e:
        logger.error(f"❌ Erreur suppression PDF: {e}")
    
    try:
        if instance.cover_image:
            instance.cover_image.delete(save=False)
            logger.info(f"🗑️ Image supprimée: {instance.cover_image.name}")
    except Exception as e:
        logger.error(f"❌ Erreur suppression image: {e}")


@receiver(pre_save, sender=Book)
def auto_delete_file_on_update(sender, instance, **kwargs):
    """
    Supprimer les anciens fichiers quand un livre est mis à jour
    """
    if not instance.pk:
        return
    
    try:
        old_instance = Book.objects.get(pk=instance.pk)
        
        # Vérifier si le PDF a changé
        if old_instance.pdf_file and old_instance.pdf_file != instance.pdf_file:
            old_instance.pdf_file.delete(save=False)
            logger.info(f"🗑️ Ancien PDF supprimé: {old_instance.pdf_file.name}")
        
        # Vérifier si l'image a changé
        if old_instance.cover_image and old_instance.cover_image != instance.cover_image:
            old_instance.cover_image.delete(save=False)
            logger.info(f"🗑️ Ancienne image supprimée: {old_instance.cover_image.name}")
            
    except Book.DoesNotExist:
        pass
    except Exception as e:
        logger.error(f"❌ Erreur suppression fichier: {e}")
