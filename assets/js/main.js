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
        const addFavoriteBtn = document.getElementById('addFavoriteBtn');
        const favoriteCityInput = document.getElementById('favoriteCityInput');
        const favoritesList = document.getElementById('favoritesList');
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

        // Gestion favoris
        this.initFavorites();
        if (addFavoriteBtn && favoriteCityInput && favoritesList) {
            addFavoriteBtn.addEventListener('click', () => {
                const city = favoriteCityInput.value.trim();
                if (!city) return;
                this.addFavorite(city);
                favoriteCityInput.value = '';
            });

            favoriteCityInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const city = favoriteCityInput.value.trim();
                    if (!city) return;
                    this.addFavorite(city);
                    favoriteCityInput.value = '';
                }
            });

            favoritesList.addEventListener('click', (e) => {
                const target = e.target;
                if (!target) return;
                const card = target.closest('[data-fav-city]');
                if (!card) return;

                const city = card.dataset.favCity;
                if (target.matches('[data-action="remove"]')) {
                    this.removeFavorite(city);
                } else {
                    const input = document.getElementById('cityInput');
                    if (input) input.value = city;
                    this.searchWeatherForCity(city);
                }
            });
        }

        // Événement de redimensionnement de la fenêtre pour la carte
        window.addEventListener('resize', () => {
            weatherMap.resize();
        });
    }

    // ------- Favoris -------
    initFavorites() {
        const stored = localStorage.getItem('atmofav:cities');
        this.favorites = stored ? JSON.parse(stored) : [];
        this.renderFavorites();
    }

    saveFavorites() {
        localStorage.setItem('atmofav:cities', JSON.stringify(this.favorites));
    }

    addFavorite(city) {
        const normalized = city.trim();
        if (!normalized) return;
        if (this.favorites.find(c => c.toLowerCase() === normalized.toLowerCase())) return;
        this.favorites.push(normalized);
        this.saveFavorites();
        this.renderFavorites();
    }

    removeFavorite(city) {
        this.favorites = this.favorites.filter(c => c.toLowerCase() !== city.toLowerCase());
        this.saveFavorites();
        this.renderFavorites();
    }

    renderFavorites() {
        const list = document.getElementById('favoritesList');
        if (!list) return;
        if (!this.favorites || this.favorites.length === 0) {
            list.innerHTML = '<div class="col-span-2 text-slate-400 text-sm">Aucun favori. Ajoutez une ville ci-dessus.</div>';
            return;
        }
        list.innerHTML = this.favorites.map(city => `
            <div class="flex items-center justify-between bg-slate-800/50 border border-slate-600/50 rounded-lg px-3 py-2 text-white cursor-pointer hover:bg-slate-800/70 transition" data-fav-city="${city}">
                <span class="font-medium">${city}</span>
                <button class="text-slate-300 hover:text-red-400 transition" data-action="remove" title="Retirer">✕</button>
            </div>
        `).join('');
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

        // Afficher les nouvelles fonctionnalités
        this.displaySunTimes(data);
        this.displayComfortIndex(data);
    }

    // Afficher les heures du soleil
    displaySunTimes(data) {
        const sunTimesContainer = document.getElementById('sunTimes');
        const sunriseElement = document.getElementById('sunrise');
        const sunsetElement = document.getElementById('sunset');

        if (sunTimesContainer && sunriseElement && sunsetElement) {
            // Simuler les heures du soleil (en réalité, il faudrait les obtenir de l'API)
            const now = new Date();
            const sunrise = new Date(now);
            sunrise.setHours(6, 30, 0, 0);
            
            const sunset = new Date(now);
            sunset.setHours(18, 45, 0, 0);

            sunriseElement.textContent = sunrise.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            sunsetElement.textContent = sunset.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            sunTimesContainer.classList.remove('hidden');
        }
    }

    // Afficher l'indice de confort thermique
    displayComfortIndex(data) {
        const comfortContainer = document.getElementById('comfortIndex');
        const comfortLevel = document.getElementById('comfortLevel');
        const comfortDescription = document.getElementById('comfortDescription');

        if (comfortContainer && comfortLevel && comfortDescription) {
            // Calculer l'indice de confort basé sur température, humidité et vent
            const temp = data.temperature;
            const humidity = data.humidity;
            const wind = data.windSpeed;

            let comfortScore = 0;
            let comfortText = '';
            let comfortColor = '';

            // Calcul basé sur la température
            if (temp >= 20 && temp <= 25) {
                comfortScore += 40;
            } else if (temp >= 18 && temp <= 28) {
                comfortScore += 30;
            } else if (temp >= 15 && temp <= 30) {
                comfortScore += 20;
            } else {
                comfortScore += 10;
            }

            // Calcul basé sur l'humidité
            if (humidity >= 40 && humidity <= 60) {
                comfortScore += 30;
            } else if (humidity >= 30 && humidity <= 70) {
                comfortScore += 20;
            } else {
                comfortScore += 10;
            }

            // Calcul basé sur le vent
            if (wind >= 1 && wind <= 5) {
                comfortScore += 30;
            } else if (wind >= 0.5 && wind <= 8) {
                comfortScore += 20;
            } else {
                comfortScore += 10;
            }

            // Déterminer le niveau de confort
            if (comfortScore >= 80) {
                comfortText = 'Excellent';
                comfortColor = 'text-green-400';
            } else if (comfortScore >= 60) {
                comfortText = 'Bon';
                comfortColor = 'text-blue-400';
            } else if (comfortScore >= 40) {
                comfortText = 'Moyen';
                comfortColor = 'text-yellow-400';
            } else {
                comfortText = 'Difficile';
                comfortColor = 'text-red-400';
            }

            comfortLevel.textContent = comfortText;
            comfortLevel.className = `font-bold text-white text-lg mb-2 ${comfortColor}`;
            comfortDescription.textContent = `Score: ${comfortScore}/100 - Temp: ${temp}°C, Humidité: ${humidity}%, Vent: ${wind} m/s`;

            comfortContainer.classList.remove('hidden');
        }
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
