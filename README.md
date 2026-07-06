# 📱 React Native CLI + Django Backend

Projet mobile développé avec [React Native CLI](https://reactnative.dev/) et backend [Django REST Framework](https://www.django-rest-framework.org/).

---

## 🚀 Frontend – React Native CLI

### Installation et lancement

1. Installer les dépendances :

   ```bash
   npm install
   ```

````

2. Démarrer Metro bundler :
```bash
npx react-native start

````

3. Lancer l’application sur Android :

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

1. Créer et activer l’environnement virtuel :

```bash
cd Backend
python -m venv venv
source venv/bin/activate   # Linux/Mac
.\venv\Scripts\activate    # Windows

```

2. Installer les dépendances :

```bash
pip install -r requirements.txt

```

3. Appliquer les migrations :

```bash
python manage.py migrate

```

4. Créer un superutilisateur :

```bash
python manage.py createsuperuser

```

5. Démarrer le serveur :

```bash
python manage.py runserver 0.0.0.0:8000

```

Par défaut :

- API → `http://127.0.0.1:8000/`
- Admin → `http://127.0.0.1:8000/admin/`

---

## 📂 Structure recommandée

```
Backend/
 ├── manage.py
 ├── core/          ← settings, urls, wsgi, asgi
 ├── library/       ← gestion des livres
 ├── users/         ← gestion des comptes
 └── payments/      ← gestion des paiements

```

---

## 🔗 Connexion Frontend ↔ Backend

Configurer l’URL API dans le frontend (`api.tsx` ou config).

- **Émulateur Android** : `http://10.0.2.2:8000/api`
- **Appareil physique USB** :

```bash
adb reverse tcp:8000 tcp:8000

```

URL → `http://localhost:8000/api`

- **Appareil physique Wi-Fi** : `http://<IP_PC>:8000/api` (ex: `192.168.201.29`)
- **Mode Web** : `http://localhost:8000/api`

---

## 🔒 Rappels Backend

- Lancer Django avec :

```bash
python manage.py runserver 0.0.0.0:8000

```

- Configurer `ALLOWED_HOSTS` :

```python
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "10.0.2.2", "192.168.201.29"]

```

- Exemple fallback dans `api.tsx` :

```typescript
const baseURL =
  "[http://192.168.201.29:8000/api](http://192.168.201.29:8000/api)";
```

- Lancer émulateur Android :

```bash
cd "$ANDROID_HOME/emulator"
./emulator -avd Medium_Phone

```

---

## 📚 Ressources utiles

- React Native docs
- [Django REST Framework](https://www.django-rest-framework.org/)
- Android Emulator setup
- LDPlayer (émulateur Android pour Windows)

---
