// Configuration de l'API météo
const WEATHER_CONFIG = {
    API_KEY: '5f5321aa9a6a59d1ab2df5248f5b9c14', // Remplacez par votre clé API OpenWeatherMap
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    UNITS: 'metric',
    LANG: 'fr'
};

// Classe pour gérer les appels à l'API météo
class WeatherAPI {
    constructor() {
        this.apiKey = WEATHER_CONFIG.API_KEY;
        this.baseUrl = WEATHER_CONFIG.BASE_URL;
    }

    // Méthode pour effectuer des requêtes AJAX
    makeRequest(url, callback, errorCallback) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        callback(data);
                    } catch (error) {
                        errorCallback('Erreur lors du parsing des données');
                    }
                } else {
                    errorCallback('Erreur lors de la requête: ' + xhr.status);
                }
            }
        };
        
        xhr.onerror = function() {
            errorCallback('Erreur de connexion');
        };
        
        xhr.send();
    }

    // Obtenir les données météo actuelles pour une ville suisse
    getCurrentWeather(cityName, callback, errorCallback) {
        const url = `${this.baseUrl}/weather?q=${encodeURIComponent(cityName)},ch&appid=${this.apiKey}&units=${WEATHER_CONFIG.UNITS}&lang=${WEATHER_CONFIG.LANG}`;
        this.makeRequest(url, (data) => {
            // Vérifier que la ville est bien en Suisse
            if (data.sys && data.sys.country === 'CH') {
                callback(data);
            } else {
                errorCallback('Cette ville n\'est pas un village ou une ville suisse');
            }
        }, (error) => {
            // Personnaliser le message d'erreur pour les villes non trouvées
            if (error.includes('404') || error.includes('not found')) {
                errorCallback('Cette ville n\'est pas un village ou une ville suisse');
            } else {
                errorCallback(error);
            }
        });
    }

    // Obtenir les prévisions météo sur 5 jours pour une ville suisse
    getForecast(cityName, callback, errorCallback) {
        const url = `${this.baseUrl}/forecast?q=${encodeURIComponent(cityName)},ch&appid=${this.apiKey}&units=${WEATHER_CONFIG.UNITS}&lang=${WEATHER_CONFIG.LANG}`;
        this.makeRequest(url, (data) => {
            // Vérifier que la ville est bien en Suisse
            if (data.city && data.city.country === 'CH') {
                callback(data);
            } else {
                errorCallback('Cette ville n\'est pas un village ou une ville suisse');
            }
        }, (error) => {
            // Personnaliser le message d'erreur pour les villes non trouvées
            if (error.includes('404') || error.includes('not found')) {
                errorCallback('Cette ville n\'est pas un village ou une ville suisse');
            } else {
                errorCallback(error);
            }
        });
    }

    // Obtenir les données météo par coordonnées
    getWeatherByCoords(lat, lon, callback, errorCallback) {
        const url = `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${WEATHER_CONFIG.UNITS}&lang=${WEATHER_CONFIG.LANG}`;
        this.makeRequest(url, callback, errorCallback);
    }

    // Obtenir les prévisions par coordonnées
    getForecastByCoords(lat, lon, callback, errorCallback) {
        const url = `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${WEATHER_CONFIG.UNITS}&lang=${WEATHER_CONFIG.LANG}`;
        this.makeRequest(url, callback, errorCallback);
    }

    // Formater les données météo pour l'affichage
    formatWeatherData(data) {
        return {
            city: data.name,
            country: data.sys.country,
            temperature: Math.round(data.main.temp),
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            windSpeed: data.wind.speed,
            visibility: data.visibility ? (data.visibility / 1000).toFixed(1) : 'N/A',
            coordinates: {
                lat: data.coord.lat,
                lon: data.coord.lon
            }
        };
    }

    // Formater les données de prévisions
    formatForecastData(data) {
        const forecasts = [];
        const dailyData = {};

        // Grouper les prévisions par jour
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateKey = date.toDateString();
            
            if (!dailyData[dateKey]) {
                dailyData[dateKey] = {
                    date: date,
                    temps: [],
                    humidity: [],
                    descriptions: [],
                    icons: []
                };
            }
            
            dailyData[dateKey].temps.push(item.main.temp);
            dailyData[dateKey].humidity.push(item.main.humidity);
            dailyData[dateKey].descriptions.push(item.weather[0].description);
            dailyData[dateKey].icons.push(item.weather[0].icon);
        });

        // Calculer les moyennes pour chaque jour
        Object.values(dailyData).forEach(day => {
            const avgTemp = day.temps.reduce((a, b) => a + b, 0) / day.temps.length;
            const maxTemp = Math.max(...day.temps);
            const minTemp = Math.min(...day.temps);
            const avgHumidity = day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length;
            
            forecasts.push({
                date: day.date,
                avgTemp: Math.round(avgTemp),
                maxTemp: Math.round(maxTemp),
                minTemp: Math.round(minTemp),
                humidity: Math.round(avgHumidity),
                description: day.descriptions[0],
                icon: day.icons[0]
            });
        });

        return forecasts.slice(0, 5); // Limiter à 5 jours
    }

    // Obtenir l'URL de l'icône météo
    getIconUrl(iconCode) {
        return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    }
}

// Instance globale de l'API météo
const weatherAPI = new WeatherAPI();
// Attacher explicitement à window pour les accès cross-fichier
try { window.weatherAPI = weatherAPI; } catch (e) { /* environnement non-browser */ }
