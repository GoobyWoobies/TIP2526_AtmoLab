# 🌤️ AtmoLab - Bulletin Météo

Une application web moderne pour consulter les prévisions météorologiques en temps réel avec des graphiques interactifs.

## 📋 Fonctionnalités

- **Recherche de ville** : Barre de recherche intuitive avec suggestions
- **Météo actuelle** : Température, ressenti, humidité, vent, pression
- **Prévisions graphiques** : Graphiques interactifs sur 5 jours avec Chart.js
- **Interface moderne** : Design glassmorphism avec TailwindCSS
- **Responsive** : Compatible mobile et desktop
- **Animations fluides** : Transitions et effets visuels
- **Raccourcis clavier** : Ctrl+K pour rechercher, Escape pour effacer

## 🚀 Installation et Configuration

### 1. Clé API OpenWeatherMap

1. Créez un compte gratuit sur [OpenWeatherMap](https://openweathermap.org/api)
2. Obtenez votre clé API gratuite
3. Ouvrez le fichier `assets/js/weather.js`
4. Remplacez `YOUR_API_KEY_HERE` par votre clé API :

```javascript
const WEATHER_CONFIG = {
    API_KEY: 'votre_cle_api_ici', // Remplacez par votre clé API
    // ...
};
```

### 2. Lancement de l'application

1. Ouvrez le fichier `index.html` dans votre navigateur web
2. Ou utilisez un serveur local (recommandé) :

```bash
# Avec Python
python -m http.server 8000

# Avec Node.js (http-server)
npx http-server

# Avec PHP
php -S localhost:8000
```

3. Accédez à `http://localhost:8000`

## 📁 Structure du Projet

```
TIP2526_AtmoLab/
├── index.html              # Page principale
├── README.md               # Documentation
└── assets/
    ├── css/
    │   └── styles.css      # Styles personnalisés
    └── js/
        ├── main.js         # Logique principale et événements
        ├── weather.js      # Service API météo avec AJAX
        └── chart.js        # Gestion des graphiques
```

## 🛠️ Technologies Utilisées

- **HTML5** : Structure sémantique
- **TailwindCSS** : Framework CSS utilitaire
- **JavaScript ES6** : Logique applicative
- **AJAX (XMLHttpRequest)** : Requêtes API sans fetch
- **Chart.js** : Graphiques interactifs
- **OpenWeatherMap API** : Données météorologiques

## 📱 Utilisation

1. **Recherche** : Tapez le nom d'une ville dans la barre de recherche
2. **Exemples** : Cliquez sur les villes d'exemple pour tester rapidement
3. **Raccourcis** :
   - `Ctrl+K` : Focus sur la recherche
   - `Escape` : Effacer les résultats
   - Swipe droite (mobile) : Effacer les résultats

## 🎨 Fonctionnalités Avancées

- **Auto-refresh** : Les données se mettent à jour automatiquement toutes les 10 minutes
- **Animations CSS** : Effets de glassmorphism et transitions fluides
- **Gestion d'erreurs** : Messages d'erreur informatifs
- **Support tactile** : Optimisé pour les appareils mobiles
- **Accessibilité** : Navigation au clavier supportée

## 🔧 Personnalisation

### Modifier les couleurs
Éditez les classes TailwindCSS dans `index.html` ou ajoutez des styles personnalisés dans `assets/css/styles.css`.

### Ajouter des données météo
Modifiez `assets/js/weather.js` pour ajouter d'autres informations de l'API OpenWeatherMap.

### Personnaliser les graphiques
Configurez Chart.js dans `assets/js/chart.js` pour modifier l'apparence des graphiques.

## 📊 API OpenWeatherMap

L'application utilise deux endpoints :
- **Current Weather** : `/weather` - Météo actuelle
- **5 Day Forecast** : `/forecast` - Prévisions sur 5 jours

## 🐛 Dépannage

### "Clé API invalide"
- Vérifiez que votre clé API est correctement configurée dans `weather.js`
- Assurez-vous que votre clé API est active (peut prendre quelques heures)

### "Ville non trouvée"
- Vérifiez l'orthographe du nom de la ville
- Essayez avec le nom en anglais
- Utilisez le format "Ville, Pays" si nécessaire

### Graphiques ne s'affichent pas
- Vérifiez que Chart.js est bien chargé
- Ouvrez la console développeur pour voir les erreurs

## 📄 Licence

Ce projet est libre d'utilisation pour des fins éducatives.

## 👨‍💻 Développement

Projet créé pour le cours TIP2526 - AtmoLab
Structure modulaire avec séparation des responsabilités :
- `main.js` : Gestion des événements et initialisation
- `weather.js` : Service API et logique météo
- `chart.js` : Visualisation des données