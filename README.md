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

## 🚀 Démarrage rapide

### Prérequis
- Navigateur web moderne
- (Optionnel) Clé API OpenWeatherMap pour la fonction « Météo actuelle »

### Configuration

1. **Cloner le projet**
   ```bash
   git clone https://github.com/votre-username/TIP2526_AtmoLab.git
   cd TIP2526_AtmoLab
   ```

2. **(Optionnel) Configurer l'API pour la météo réelle**
   - Créez un compte sur [OpenWeatherMap](https://openweathermap.org/api)
   - Copiez votre clé API dans `assets/js/weather-api.js` au champ `API_KEY`

3. **Lancer l'application**
   - Ouvrez `index.html` pour l’application météo
   - Ouvrez `lab.html` pour le simulateur météorologique interactif

## 📁 Architecture

```
TIP2526_AtmoLab/
├── 📄 index.html                    # Application météo (accueil)
├── 📁 assets/js/
│   ├── 🧠 main.js                   # Logique de l’application
│   ├── 🌐 weather-api.js           # Appels OpenWeather (météo réelle)
│   ├── 🗺️ map.js                   # Carte interactive (application)
│   ├── 📊 charts.js                # Graphiques (application)
│   ├── 🧪 lab-main.js              # Logique du simulateur (lab)
│   ├── 🧪 lab-simulation.js        # Modèle et calculs (lab)
│   └── 📈 lab-charts.js            # Graphiques comparatifs (lab)
├── 🧪 lab.html                      # Simulateur météo (lab)
└── 📖 README.md                    # Documentation
```

## 🎯 Utilisation

### Application météo (index.html)
- **Recherche**: entrez une localité en Suisse, les données s’affichent instantanément.
- **Prévisions**: visualisez les tendances (température, humidité, etc.).
- **Carte**: repérez la localité sur une carte interactive.

### Simulateur météo (lab.html)
- **Réglez les paramètres**: température, humidité, pression, vent, nuages, précipitations.
- **Lancez une simulation**: obtenez un résumé clair et des indicateurs détaillés.
- **Graphiques**: comparez vos dernières simulations sur des courbes.
- **Météo actuelle (optionnel)**: avec une clé API, récupérez la météo réelle et appliquez-la comme point de départ.

## 🇨🇭 Spécificités suisses

L’application se concentre sur les localités suisses (code pays `CH`) pour des résultats pertinents et des messages d’erreur adaptés.

## 🔧 Développement

### Structure du code
- **JavaScript modulaire**: logique séparée par fonctionnalités.
- **Requêtes AJAX**: `XMLHttpRequest` simple et compatible.
- **Aucune étape de build**: ouvrir les fichiers `.html` suffit pour démarrer.

### Personnalisation
```javascript
// Configuration des alertes
const alertThresholds = {
    temperature: { hot: 30, cold: 0 },
    wind: { strong: 10 },
    humidity: { high: 90 }
};
```

## 📊 Données API (optionnelles)

Si vous activez l’API OpenWeather:
- Endpoints: `weather` (actuel), `forecast` (5 jours)
- Données: température, conditions, vent, humidité, pression, coordonnées

## 🤝 Contribution

1. Fork du projet
2. Créez une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commitez (`git commit -m "feat: ajout de ..."`)
4. Poussez (`git push origin feature/ma-fonctionnalite`)
5. Ouvrez une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

### Problèmes courants
- **Clé API manquante**: renseignez `API_KEY` dans `assets/js/weather-api.js` si vous utilisez la météo réelle.
- **Localité introuvable**: vérifiez qu’elle se situe en Suisse.
- **Rien ne s’affiche**: contrôlez votre connexion internet.

### Contact
- 📧 Email: votre.email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/votre-username/TIP2526_AtmoLab/issues)

---

<div align="center">

**Fait avec ❤️ pour la Suisse**

![Made in Switzerland](https://img.shields.io/badge/Made%20in-Switzerland-red?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjREEwMDIwIi8+CjxwYXRoIGQ9Ik0xMiA2VjE4TTYgMTJIMTgiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMyIvPgo8L3N2Zz4K)

</div>
