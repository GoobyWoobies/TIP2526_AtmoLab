# Bulletin Météo

Une application web moderne pour consulter les informations météorologiques et les prévisions.

## Fonctionnalités

- **Recherche de ville** : Barre de recherche pour trouver les données météo de n'importe quelle ville
- **Informations météo actuelles** : Température, humidité, vitesse du vent, pression atmosphérique, visibilité
- **Carte interactive** : Localisation de la ville recherchée sur une carte
- **Prévisions sur 5 jours** : Graphiques des températures et de l'humidité
- **Interface responsive** : Optimisée pour tous les appareils

## Technologies utilisées

- **HTML5** : Structure de la page
- **TailwindCSS** : Framework CSS pour le design
- **JavaScript** : Logique de l'application (pas de classes ES6, requêtes AJAX)
- **Chart.js** : Graphiques des prévisions météo
- **Leaflet** : Carte interactive
- **OpenWeatherMap API** : Données météorologiques

## Installation et configuration

1. **Cloner le projet** ou télécharger les fichiers
2. **Obtenir une clé API OpenWeatherMap** :
   - Créer un compte sur [OpenWeatherMap](https://openweathermap.org/api)
   - Générer une clé API gratuite
3. **Configurer la clé API** :
   - Ouvrir le fichier `assets/js/weather-api.js`
   - Remplacer `YOUR_API_KEY_HERE` par votre clé API
4. **Lancer l'application** :
   - Ouvrir `index.html` dans un navigateur web

## Structure du projet

```
TIP2526_AtmoLab/
├── index.html              # Page principale
├── assets/
│   └── js/
│       ├── main.js         # Application principale
│       ├── weather-api.js  # Gestion de l'API météo
│       ├── map.js          # Carte interactive
│       └── charts.js       # Graphiques
└── README.md              # Documentation
```

## Utilisation

1. **Rechercher une ville** : Entrer le nom d'une ville dans la barre de recherche
2. **Consulter les informations** : Les données météo actuelles s'affichent automatiquement
3. **Voir la localisation** : La carte montre l'emplacement de la ville
4. **Analyser les prévisions** : Les graphiques affichent les tendances sur 5 jours

## API utilisée

L'application utilise l'API OpenWeatherMap pour récupérer :
- Les données météo actuelles
- Les prévisions sur 5 jours
- Les coordonnées géographiques

## Fonctionnalités à venir

L'espace réservé dans la colonne de gauche peut accueillir de futures fonctionnalités comme :
- Historique des recherches
- Villes favorites
- Alertes météo
- Comparaison de villes

## Support

Pour toute question ou problème, vérifiez :
1. Que votre clé API est correctement configurée
2. Que vous avez une connexion internet
3. Que le nom de la ville est correct
