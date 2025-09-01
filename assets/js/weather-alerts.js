// Système d'alertes météo
class WeatherAlerts {
    constructor() {
        this.alertsContainer = null;
    }

    // Initialiser le système d'alertes
    init() {
        this.alertsContainer = document.getElementById('alertsContainer');
    }

    // Analyser les données météo et générer des alertes
    generateAlerts(weatherData, forecastData) {
        if (!this.alertsContainer) return;

        const alerts = [];
        
        // Vérifier les conditions actuelles
        this.checkCurrentWeatherAlerts(weatherData, alerts);
        
        // Vérifier les prévisions
        if (forecastData && forecastData.length > 0) {
            this.checkForecastAlerts(forecastData, alerts);
        }

        // Afficher les alertes
        this.displayAlerts(alerts);
    }

    // Vérifier les alertes pour les conditions actuelles
    checkCurrentWeatherAlerts(data, alerts) {
        // Alerte température élevée (canicule)
        if (data.temperature >= 30) {
            alerts.push({
                type: 'warning',
                icon: '🔥',
                title: 'Canicule',
                message: `Température élevée: ${data.temperature}°C`,
                color: 'red'
            });
        }

        // Alerte température basse (gel)
        if (data.temperature <= 0) {
            alerts.push({
                type: 'info',
                icon: '🧊',
                title: 'Risque de gel',
                message: `Température: ${data.temperature}°C`,
                color: 'cyan'
            });
        }

        // Alerte vent fort
        if (data.windSpeed >= 10) {
            alerts.push({
                type: 'warning',
                icon: '💨',
                title: 'Vent fort',
                message: `Vitesse du vent: ${data.windSpeed} m/s`,
                color: 'yellow'
            });
        }

        // Alerte humidité élevée
        if (data.humidity >= 90) {
            alerts.push({
                type: 'info',
                icon: '💧',
                title: 'Humidité élevée',
                message: `Humidité: ${data.humidity}%`,
                color: 'blue'
            });
        }

        // Alerte pression basse
        if (data.pressure <= 1000) {
            alerts.push({
                type: 'info',
                icon: '📉',
                title: 'Pression atmosphérique basse',
                message: `Pression: ${data.pressure} hPa`,
                color: 'gray'
            });
        }
    }

    // Vérifier les alertes dans les prévisions
    checkForecastAlerts(forecastData, alerts) {
        // Chercher de la pluie dans les prochains jours
        const rainDays = forecastData.filter(day => 
            day.description.includes('pluie') || 
            day.description.includes('orage') ||
            day.description.includes('averse')
        );

        if (rainDays.length > 0) {
            alerts.push({
                type: 'info',
                icon: '🌧️',
                title: 'Pluie prévue',
                message: `Pluie attendue dans ${rainDays.length} jour(s)`,
                color: 'blue'
            });
        }

        // Chercher de la neige
        const snowDays = forecastData.filter(day => 
            day.description.includes('neige')
        );

        if (snowDays.length > 0) {
            alerts.push({
                type: 'warning',
                icon: '❄️',
                title: 'Neige prévue',
                message: `Neige attendue dans ${snowDays.length} jour(s)`,
                color: 'gray'
            });
        }

        // Vérifier les variations importantes de température
        const temps = forecastData.map(day => day.avgTemp);
        const maxTemp = Math.max(...temps);
        const minTemp = Math.min(...temps);
        
        if (maxTemp - minTemp > 15) {
            alerts.push({
                type: 'info',
                icon: '🌡️',
                title: 'Variations importantes',
                message: `Écart de ${Math.round(maxTemp - minTemp)}°C prévu`,
                color: 'orange'
            });
        }
    }

    // Afficher les alertes dans l'interface
    displayAlerts(alerts) {
        if (alerts.length === 0) {
            this.alertsContainer.innerHTML = `
                <div class="flex items-center space-x-2 text-green-600">
                    <span class="text-lg">✅</span>
                    <span class="text-sm">Aucune alerte météo pour le moment</span>
                </div>
            `;
            return;
        }

        const alertsHTML = alerts.map(alert => {
            const colorClasses = this.getColorClasses(alert.color);
            return `
                <div class="flex items-start space-x-3 p-3 ${colorClasses.bg} ${colorClasses.border} border-l-4 rounded-r-lg">
                    <span class="text-lg">${alert.icon}</span>
                    <div class="flex-1">
                        <h5 class="font-medium ${colorClasses.text}">${alert.title}</h5>
                        <p class="text-sm ${colorClasses.textLight}">${alert.message}</p>
                    </div>
                </div>
            `;
        }).join('');

        this.alertsContainer.innerHTML = alertsHTML;
    }

    // Obtenir les classes CSS pour les couleurs
    getColorClasses(color) {
        const colorMap = {
            red: {
                bg: 'bg-red-50',
                border: 'border-red-400',
                text: 'text-red-800',
                textLight: 'text-red-600'
            },
            blue: {
                bg: 'bg-blue-50',
                border: 'border-blue-400',
                text: 'text-blue-800',
                textLight: 'text-blue-600'
            },
            yellow: {
                bg: 'bg-yellow-50',
                border: 'border-yellow-400',
                text: 'text-yellow-800',
                textLight: 'text-yellow-600'
            },
            cyan: {
                bg: 'bg-cyan-50',
                border: 'border-cyan-400',
                text: 'text-cyan-800',
                textLight: 'text-cyan-600'
            },
            gray: {
                bg: 'bg-gray-50',
                border: 'border-gray-400',
                text: 'text-gray-800',
                textLight: 'text-gray-600'
            },
            orange: {
                bg: 'bg-orange-50',
                border: 'border-orange-400',
                text: 'text-orange-800',
                textLight: 'text-orange-600'
            }
        };

        return colorMap[color] || colorMap.gray;
    }
}

// Instance globale des alertes météo
const weatherAlerts = new WeatherAlerts();
