# 🌤️ AtmoLab - Bulletin Météo Suisse

<div align="center">

![Weather App](https://img.shields.io/badge/Weather-App-blue?style=for-the-badge&logo=weather&logoColor=white)
![Switzerland](https://img.shields.io/badge/Switzerland-Only-red?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjREEwMDIwIi8+CjxwYXRoIGQ9Ik0xMiA2VjE4TTYgMTJIMTgiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMyIvPgo8L3N2Zz4K)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

*Application météo moderne dédiée aux villes et villages suisses*

</div>

## ✨ Fonctionnalités

🔍 **Recherche intelligente** - Toutes les villes et villages suisses  
🌡️ **Données en temps réel** - Température, humidité, vent, pression  
🗺️ **Carte interactive** - Localisation précise avec Leaflet  
📊 **Graphiques dynamiques** - Prévisions sur 5 jours  
🚨 **Alertes météo** - Notifications intelligentes  
📱 **Design responsive** - Interface moderne avec TailwindCSS  

## 🛠️ Stack Technique

<div align="center">

| Frontend | API & Data | Outils |
|----------|------------|--------|
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) | ![OpenWeatherMap](https://img.shields.io/badge/OpenWeatherMap-FF6B35?style=flat&logo=weather&logoColor=white) | ![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white) |
| ![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC?style=flat&logo=tailwind-css&logoColor=white) | ![AJAX](https://img.shields.io/badge/AJAX-005571?style=flat&logo=javascript&logoColor=white) | ![VS Code](https://img.shields.io/badge/VS%20Code-007ACC?style=flat&logo=visual-studio-code&logoColor=white) |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) | ![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat&logo=chart.js&logoColor=white) | |
| ![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=flat&logo=leaflet&logoColor=white) | | |

</div>

## 🚀 Installation Rapide

### Prérequis
- Navigateur web moderne
- Clé API OpenWeatherMap (gratuite)

### Configuration

1. **Cloner le projet**
   ```bash
   git clone https://github.com/votre-username/TIP2526_AtmoLab.git
   cd TIP2526_AtmoLab
   ```

2. **Obtenir une clé API**
   - Créer un compte sur [OpenWeatherMap](https://openweathermap.org/api)
   - Générer une clé API gratuite

3. **Configurer l'API**
   ```javascript
   // Dans assets/js/weather-api.js
   const WEATHER_CONFIG = {
       API_KEY: 'VOTRE_CLE_API_ICI', // Remplacer YOUR_API_KEY_HERE
       // ...
   };
   ```

4. **Lancer l'application**
   ```bash
   # Ouvrir index.html dans votre navigateur
   open index.html
   ```

## 📁 Architecture

```
TIP2526_AtmoLab/
├── 📄 index.html                    # Interface principale
├── 📁 assets/js/
│   ├── 🧠 main.js                   # Logique principale
│   ├── 🌐 weather-api.js           # Gestion API OpenWeather
│   ├── 🗺️ map.js                   # Carte interactive
│   ├── 📊 charts.js                # Graphiques Chart.js
│   └── 🚨 weather-alerts.js        # Système d'alertes
└── 📖 README.md                    # Documentation
```

## 🎯 Utilisation

### Recherche de ville
1. Saisir le nom d'une ville suisse dans la barre de recherche
2. Les données s'affichent automatiquement
3. Navigation interactive avec carte et graphiques

### Fonctionnalités avancées
- **Alertes automatiques** : Canicule, gel, vent fort, etc.
- **Prévisions détaillées** : Graphiques température et humidité
- **Géolocalisation** : Carte avec marqueur précis

## 🇨🇭 Spécificités Suisses

L'application utilise le code pays ISO `CH` pour garantir :
- ✅ Recherche limitée aux localités suisses
- ✅ Support de tous les villages et villes
- ✅ Validation automatique par l'API
- ✅ Messages d'erreur contextuels

## 🔧 Développement

### Structure du code
- **Pas de classes ES6** : Code compatible navigateurs anciens
- **Requêtes AJAX** : XMLHttpRequest natif
- **Modularité** : Fichiers séparés par fonctionnalité

### Personnalisation
```javascript
// Configuration des alertes
const alertThresholds = {
    temperature: { hot: 30, cold: 0 },
    wind: { strong: 10 },
    humidity: { high: 90 }
};
```

## 📊 Données API

### Endpoints utilisés
- `weather?q=ville,ch` - Météo actuelle
- `forecast?q=ville,ch` - Prévisions 5 jours

### Données récupérées
- Température (min/max/moyenne)
- Conditions météo et icônes
- Vent, humidité, pression
- Coordonnées géographiques

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

### Problèmes courants
- **Clé API manquante** : Vérifier la configuration dans `weather-api.js`
- **Ville non trouvée** : S'assurer que c'est une localité suisse
- **Données non affichées** : Vérifier la connexion internet

### Contact
- 📧 Email : votre.email@example.com
- 🐛 Issues : [GitHub Issues](https://github.com/votre-username/TIP2526_AtmoLab/issues)

---

<div align="center">

**Fait avec ❤️ pour la Suisse**

![Made in Switzerland](https://img.shields.io/badge/Made%20in-Switzerland-red?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjREEwMDIwIi8+CjxwYXRoIGQ9Ik0xMiA2VjE4TTYgMTJIMTgiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMyIvPgo8L3N2Zz4K)

</div>
