# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

---

# Backend – Django ⚙️

Ce projet utilise [Django](https://www.djangoproject.com/) et [Django REST Framework](https://www.django-rest-framework.org/) pour fournir une API sécurisée.

## Get started

1. Créer et activer l’environnement virtuel

   ```bash
   cd Backend
   python -m venv venv
   source venv/bin/activate   # Linux/Mac
   .\venv\Scripts\activate    # Windows PowerShell
   ```

2. Installer les dépendances

   ```bash
   pip install -r requirements.txt
   ```

3. Appliquer les migrations

   ```bash
   python manage.py migrate
   ```

4. Créer un superutilisateur (admin)

   ```bash
   python manage.py createsuperuser
   ```

5. Démarrer le serveur

   ```bash
   python manage.py runserver
   ```

Par défaut, le serveur est accessible sur :

- `http://127.0.0.1:8000/` [(127.0.0.1 in Bing)](https://www.bing.com/search?q="http%3A%2F%2F127.0.0.1%3A8000%2F") → API principale
- `http://127.0.0.1:8000/admin/` [(127.0.0.1 in Bing)](https://www.bing.com/search?q="http%3A%2F%2F127.0.0.1%3A8000%2Fadmin%2F") → interface d’administration

---

## Structure recommandée

```
Backend/
 ├── manage.py
 ├── core/          ← projet Django (settings, urls, wsgi, asgi)
 ├── library/       ← app pour gérer les livres
 ├── users/         ← app pour gérer les comptes
 └── payments/      ← app pour gérer les paiements
```

---

## Other setup steps

- Configurer DRF pour exposer des endpoints REST.
- Configurer JWT pour l’authentification sécurisée.
- Configurer CORS pour autoriser les requêtes du frontend Expo.
- Configurer static/media pour gérer les fichiers statiques et médias.
