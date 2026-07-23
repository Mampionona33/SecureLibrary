Voici le README.md mis à jour avec la section sur la mise en place du backend Django :

```markdown
# 📱 React Native CLI + Django Backend

Projet mobile développé avec [React Native CLI](https://reactnative.dev/) et backend [Django REST Framework](https://www.django-rest-framework.org/).

---

## 🚀 Frontend – React Native CLI

### Installation et lancement

1. Installer les dépendances :

   ```bash
   npm install
   ```

2. Démarrer Metro bundler :
   ```bash
   npx react-native start
   ```

3. Lancer l'application sur Android :

   ```bash
   npx react-native run-android
   ```

   ⚡ Pour une compilation rapide :

   ```bash
   npx react-native run-android --active-arch-only
   ```

4. Lancer sur iOS (Mac uniquement) :

   ```bash
   npx react-native run-ios
   ```

### Autres commandes utiles

- Nettoyer et réinstaller :

```bash
rm -rf node_modules
npm install
```

- Générer APK :

```bash
cd android
./gradlew assembleDebug
./gradlew assembleRelease
```

- Spécifier un device :

```bash
npx react-native run-android --deviceId emulator-5554
```

---

### 🛠 Dépannage rapide

- **Écran rouge / Erreur de chargement du script Metro** (Si l'application n'arrive pas à se connecter au serveur de développement sur l'émulateur) :

```bash
adb reverse tcp:8081 tcp:8081
```

_Après avoir exécuté cette commande, secouez l'appareil ou faites `Ctrl + M` sur l'émulateur puis cliquez sur **Reload**._

- **Réinitialiser Gradle** (utile si la build échoue ou après modification des fichiers Gradle) :

```bash
cd android
./gradlew clean        # Linux/Mac
.\gradlew clean        # Windows
```

---

## ⚙️ Backend – Django

### Installation et lancement

1. **Créer l'environnement virtuel :**

   ```bash
   cd Backend
   python -m venv venv
   ```

   Pour une meilleure isolation des dépendances, l'environnement virtuel permet de gérer les paquets Python propres à ce projet.

2. **Activer l'environnement virtuel :**

   ```bash
   source venv/bin/activate   # Linux/Mac
   .\venv\Scripts\activate    # Windows
   ```

   Vous devriez voir `(venv)` apparaître dans votre terminal, indiquant que l'environnement est actif.

3. **Installer les dépendances :**

   ```bash
   pip install -r requirements.txt
   ```

   Si `requirements.txt` n'existe pas encore, créez-le avec les dépendances principales :

   ```bash
   pip install django djangorestframework django-cors-headers
   pip freeze > requirements.txt
   ```

4. **Appliquer les migrations (créer la base de données) :**

   ```bash
   python manage.py migrate
   ```

5. **Créer un superutilisateur (accès admin) :**

   ```bash
   python manage.py createsuperuser
   ```

   Suivez les instructions pour définir un nom d'utilisateur, email et mot de passe.

6. **Démarrer le serveur de développement :**

   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

   Par défaut :
   - API → `http://127.0.0.1:8000/`
   - Admin → `http://127.0.0.1:8000/admin/`
   - Accès réseau local → `http://<IP_PC>:8000/`

### Commandes utiles pour le backend

- **Désactiver l'environnement virtuel :**
  ```bash
  deactivate
  ```

- **Créer une nouvelle application Django :**
  ```bash
  python manage.py startapp nom_app
  ```

- **Créer des migrations après modification des modèles :**
  ```bash
  python manage.py makemigrations
  python manage.py migrate
  ```

- **Voir toutes les routes disponibles :**
  ```bash
  python manage.py show_urls  # Nécessite django-extensions
  ```

- **Accéder au shell Django :**
  ```bash
  python manage.py shell
  ```

---

## 📂 Structure recommandée

```
Backend/
 ├── manage.py
 ├── requirements.txt
 ├── venv/            ← Environnement virtuel (à ignorer dans .gitignore)
 ├── core/            ← settings, urls, wsgi, asgi
 ├── library/         ← gestion des livres
 ├── users/           ← gestion des comptes
 ├── payments/        ← gestion des paiements
 └── media/           ← fichiers uploadés (images, PDF)
```

### Configuration `settings.py` (extrait essentiel)

```python
# Autoriser les connexions depuis l'émulateur et le réseau local
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "10.0.2.2", "192.168.201.29"]

# CORS pour autoriser le frontend
INSTALLED_APPS = [
    # ...
    'corsheaders',
    'rest_framework',
    # vos apps...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:8081",   # Metro bundler
    "http://10.0.2.2:8081",   # Émulateur Android
    "http://192.168.201.29:8081",  # Appareil physique en Wi-Fi
]

# Pour le développement, vous pouvez autoriser toutes les origines :
CORS_ALLOW_ALL_ORIGINS = True  # À utiliser uniquement en développement !
```

---

## 🔗 Connexion Frontend ↔ Backend

Configurer l'URL API dans le frontend (`api.tsx` ou fichier de configuration).

### Pour chaque type d'appareil :

| Appareil | URL API | Commande supplémentaire |
|----------|---------|------------------------|
| **Émulateur Android** | `http://10.0.2.2:8000/api` | - |
| **Appareil physique USB** | `http://localhost:8000/api` | `adb reverse tcp:8000 tcp:8000` |
| **Appareil physique Wi-Fi** | `http://<IP_PC>:8000/api` (ex: `192.168.201.29`) | - |
| **Mode Web (React Native Web)** | `http://localhost:8000/api` | - |

### Exemple de configuration dans `api.tsx` :

```typescript
// Détection automatique de l'environnement
const getBaseURL = () => {
  // Si on est sur Android émulateur
  if (Platform.OS === 'android' && __DEV__) {
    return 'http://10.0.2.2:8000/api';
  }
  // Si on est sur iOS ou Web
  if (Platform.OS === 'ios' || Platform.OS === 'web') {
    return 'http://localhost:8000/api';
  }
  // Fallback pour appareil physique
  return 'http://192.168.201.29:8000/api';
};

const baseURL = getBaseURL();
```

### Vérification de la connexion :

1. **Démarrer le backend** : `python manage.py runserver 0.0.0.0:8000`
2. **Tester l'API** : Ouvrir `http://<IP_PC>:8000/api/` dans un navigateur
3. **Tester depuis l'émulateur** : 
   - Ouvrir le navigateur de l'émulateur
   - Accéder à `http://10.0.2.2:8000/api/`

---

## 🔒 Rappels Backend

- **Toujours démarrer Django avec :**
  ```bash
  python manage.py runserver 0.0.0.0:8000
  ```
  (Le `0.0.0.0` permet l'accès depuis le réseau local)

- **Configurer `ALLOWED_HOSTS`** pour chaque nouvelle IP :
  ```python
  ALLOWED_HOSTS = ["localhost", "127.0.0.1", "10.0.2.2", "192.168.201.29", "votre-ip"]
  ```

- **Pour les requêtes API authentifiées**, utiliser les tokens JWT ou les sessions Django.

- **Ne jamais commiter** :
  - `venv/` (environnement virtuel)
  - `__pycache__/`
  - `*.pyc`
  - `.env` (variables d'environnement)
  - `media/` (fichiers uploadés en développement)

---

## 🏃 Lancer l'émulateur Android

### Depuis la ligne de commande :

```bash
cd "$ANDROID_HOME/emulator"
./emulator -avd Medium_Phone
```

### Vérifier les AVD disponibles :

```bash
cd "$ANDROID_HOME/emulator"
./emulator -list-avds
```

---

## 📚 Ressources utiles

- [React Native docs](https://reactnative.dev/docs/getting-started)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Android Emulator setup](https://developer.android.com/studio/run/emulator)
- [LDPlayer](https://www.ldplayer.net/) (émulateur Android pour Windows)
- [React Native Debugging](https://reactnative.dev/docs/debugging)
- [Django CORS Headers](https://pypi.org/project/django-cors-headers/)

---
