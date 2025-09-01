// Application principale de bulletin météo
class WeatherApp {
    constructor() {
        this.currentWeatherData = null;
        this.currentForecastData = null;
        this.initializeApp();
    }

    // Initialiser l'application
    initializeApp() {
        this.bindEvents();
        this.showWelcomeMessage();
        weatherAlerts.init();
        // Charger Fribourg au démarrage
        this.loadDefaultCity();
    }

    // Lier les événements
    bindEvents() {
        const searchBtn = document.getElementById('searchBtn');
        const cityInput = document.getElementById('cityInput');

        // Événement du bouton de recherche
        searchBtn.addEventListener('click', () => {
            this.searchWeather();
        });

        // Événement de la touche Entrée dans le champ de recherche
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchWeather();
            }
        });

        // Événement de redimensionnement de la fenêtre pour la carte
        window.addEventListener('resize', () => {
            weatherMap.resize();
        });
    }

    // Afficher un message de bienvenue
    showWelcomeMessage() {
        console.log('Application météo initialisée');
    }

    // Charger la ville par défaut (Fribourg)
    loadDefaultCity() {
        const cityInput = document.getElementById('cityInput');
        cityInput.value = 'Fribourg';
        
        // Attendre un peu que l'API soit prête, puis rechercher
        setTimeout(() => {
            this.searchWeatherForCity('Fribourg');
        }, 500);
    }

    // Rechercher les données météo pour une ville spécifique
    searchWeatherForCity(cityName) {
        // Vérifier si la clé API est configurée
        if (weatherAPI.apiKey === 'YOUR_API_KEY_HERE') {
            this.showError('Veuillez configurer votre clé API OpenWeatherMap dans le fichier weather-api.js');
            return;
        }

        this.showLoader(true);

        // Rechercher les données météo actuelles
        weatherAPI.getCurrentWeather(
            cityName,
            (data) => {
                this.currentWeatherData = weatherAPI.formatWeatherData(data);
                this.displayCurrentWeather();
                this.initializeMap();
                this.searchForecastForCity(cityName);
            },
            (error) => {
                this.showLoader(false);
                this.showError('Ville non trouvée ou erreur de connexion');
                console.error('Erreur météo actuelle:', error);
            }
        );
    }

    // Rechercher les données météo pour une ville
    searchWeather() {
        const cityInput = document.getElementById('cityInput');
        const cityName = cityInput.value.trim();

        if (!cityName) {
            this.showError('Veuillez entrer le nom d\'une ville');
            return;
        }

        this.searchWeatherForCity(cityName);
    }

    // Rechercher les prévisions météo pour une ville spécifique
    searchForecastForCity(cityName) {
        weatherAPI.getForecast(
            cityName,
            (data) => {
                this.showLoader(false);
                this.currentForecastData = weatherAPI.formatForecastData(data);
                this.displayForecast();
                // Générer les alertes météo
                weatherAlerts.generateAlerts(this.currentWeatherData, this.currentForecastData);
            },
            (error) => {
                this.showLoader(false);
                this.showError('Erreur lors du chargement des prévisions');
                console.error('Erreur prévisions:', error);
            }
        );
    }

    // Afficher les données météo actuelles
    displayCurrentWeather() {
        const weatherInfo = document.getElementById('weatherInfo');
        const cityName = document.getElementById('cityName');
        const weatherDescription = document.getElementById('weatherDescription');
        const weatherIcon = document.getElementById('weatherIcon');
        const temperature = document.getElementById('temperature');
        const humidity = document.getElementById('humidity');
        const windSpeed = document.getElementById('windSpeed');
        const pressure = document.getElementById('pressure');
        const visibility = document.getElementById('visibility');

        const data = this.currentWeatherData;

        // Remplir les éléments avec les données
        cityName.textContent = `${data.city}, ${data.country}`;
        weatherDescription.textContent = data.description;
        weatherIcon.src = weatherAPI.getIconUrl(data.icon);
        weatherIcon.alt = data.description;
        temperature.textContent = `${data.temperature}°C`;
        humidity.textContent = `${data.humidity}%`;
        windSpeed.textContent = `${data.windSpeed} m/s`;
        pressure.textContent = `${data.pressure} hPa`;
        visibility.textContent = `${data.visibility} km`;

        // Afficher le conteneur des informations météo
        weatherInfo.classList.remove('hidden');
    }

    // Initialiser et afficher la carte
    initializeMap() {
        const mapContainer = document.getElementById('mapContainer');
        const data = this.currentWeatherData;

        // Afficher le conteneur de la carte
        mapContainer.classList.remove('hidden');

        // Initialiser la carte avec les coordonnées de la ville
        weatherMap.initMap('map', data.coordinates.lat, data.coordinates.lon);
        weatherMap.updateLocation(data.coordinates.lat, data.coordinates.lon, data.city);
    }

    // Afficher les prévisions météo
    displayForecast() {
        const forecastContainer = document.getElementById('forecastContainer');

        // Afficher le conteneur des prévisions
        forecastContainer.classList.remove('hidden');

        // Créer les graphiques
        weatherCharts.createTemperatureChart('temperatureChart', this.currentForecastData);
        weatherCharts.createHumidityChart('humidityChart', this.currentForecastData);

        // Créer les cartes de prévisions détaillées
        weatherCharts.createForecastCards('forecastDetails', this.currentForecastData);
    }

    // Afficher le loader
    showLoader(show) {
        const loader = document.getElementById('loader');
        if (show) {
            loader.classList.remove('hidden');
        } else {
            loader.classList.add('hidden');
        }
    }

    // Afficher un message d'erreur
    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');

        errorText.textContent = message;
        errorMessage.classList.remove('hidden');

        // Masquer le message après 5 secondes
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 5000);
    }

    // Réinitialiser l'affichage
    resetDisplay() {
        document.getElementById('weatherInfo').classList.add('hidden');
        document.getElementById('mapContainer').classList.add('hidden');
        document.getElementById('forecastContainer').classList.add('hidden');
        weatherCharts.destroyCharts();
    }
}

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    const app = new WeatherApp();
    
    // Rendre l'instance accessible globalement pour le débogage
    window.weatherApp = app;
});
