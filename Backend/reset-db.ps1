# reset-db.ps1 - Réinitialiser DB et media

Write-Host "Suppression de la base SQLite..."
Remove-Item -Force .\db.sqlite3

Write-Host "Suppression du dossier media..."
Remove-Item -Recurse -Force .\media

Write-Host "Suppression des migrations..."
Get-ChildItem -Recurse -Include *.py -Path .\*migrations* | 
    Where-Object { $_.Name -ne "__init__.py" } | 
    Remove-Item -Force

Write-Host "Recréation des migrations..."
python manage.py makemigrations
python manage.py migrate

Write-Host "Création du superuser..."
python manage.py createsuperuser
