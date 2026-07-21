import os
from django.core.management.base import BaseCommand
from django.core.files.storage import default_storage
from library.models import Book


class Command(BaseCommand):
    help = 'Supprime les fichiers médias orphelins (non référencés dans la base)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simuler sans supprimer',
        )
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Afficher plus de détails',
        )

    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        verbose = options.get('verbose', False)

        self.stdout.write(self.style.SUCCESS('🔍 Recherche des fichiers orphelins...'))

        # 1. Récupérer tous les chemins de fichiers dans la base
        existing_files = set()
        books = Book.objects.all()
        
        for book in books:
            if book.pdf_file:
                existing_files.add(book.pdf_file.name)
            if book.cover_image:
                existing_files.add(book.cover_image.name)
        
        if verbose:
            self.stdout.write(f'📚 {books.count()} livres trouvés')
            self.stdout.write(f'📄 {len(existing_files)} fichiers référencés')

        # 2. Parcourir le dossier media
        media_root = default_storage.location
        deleted_count = 0
        total_size = 0
        
        if not os.path.exists(media_root):
            self.stdout.write(self.style.ERROR('❌ Dossier media introuvable'))
            return

        for root, dirs, files in os.walk(media_root):
            for file in files:
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, media_root).replace('\\', '/')
                
                if relative_path not in existing_files:
                    file_size = os.path.getsize(file_path)
                    
                    if verbose:
                        self.stdout.write(f'   Orphelin: {relative_path} ({file_size} bytes)')
                    
                    if not dry_run:
                        try:
                            os.remove(file_path)
                            deleted_count += 1
                            total_size += file_size
                        except Exception as e:
                            self.stdout.write(self.style.ERROR(f'   ❌ Erreur: {e}'))

        # 3. Résumé
        self.stdout.write(self.style.SUCCESS('\n📊 Résumé:'))
        self.stdout.write(f'   📄 Fichiers supprimés: {deleted_count}')
        self.stdout.write(f'   💾 Taille récupérée: {total_size / (1024*1024):.2f} MB')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('\n⚠️ Mode DRY RUN - Aucune modification effectuée'))
