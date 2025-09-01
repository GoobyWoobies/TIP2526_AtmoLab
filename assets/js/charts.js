// Classe pour gérer les graphiques météo
class WeatherCharts {
    constructor() {
        this.temperatureChart = null;
        this.humidityChart = null;
    }

    // Créer le graphique des températures
    createTemperatureChart(canvasId, forecastData) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        // Détruire le graphique existant s'il y en a un
        if (this.temperatureChart) {
            this.temperatureChart.destroy();
        }

        const labels = forecastData.map(day => {
            return day.date.toLocaleDateString('fr-FR', { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short' 
            });
        });

        const maxTemps = forecastData.map(day => day.maxTemp);
        const minTemps = forecastData.map(day => day.minTemp);
        const avgTemps = forecastData.map(day => day.avgTemp);

        this.temperatureChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Température Max (°C)',
                        data: maxTemps,
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Température Moyenne (°C)',
                        data: avgTemps,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Température Min (°C)',
                        data: minTemps,
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.4,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2.5,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Température (°C)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Jours'
                        }
                    }
                }
            }
        });
    }

    // Créer le graphique de l'humidité
    createHumidityChart(canvasId, forecastData) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        // Détruire le graphique existant s'il y en a un
        if (this.humidityChart) {
            this.humidityChart.destroy();
        }

        const labels = forecastData.map(day => {
            return day.date.toLocaleDateString('fr-FR', { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short' 
            });
        });

        const humidityData = forecastData.map(day => day.humidity);

        this.humidityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Humidité (%)',
                    data: humidityData,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2.5,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Humidité (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Jours'
                        }
                    }
                }
            }
        });
    }

    // Créer les cartes de prévisions détaillées
    createForecastCards(containerId, forecastData) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        forecastData.forEach(day => {
            const card = document.createElement('div');
            card.className = 'bg-gray-50 rounded-lg p-4 text-center';
            
            const dayName = day.date.toLocaleDateString('fr-FR', { 
                weekday: 'long',
                day: 'numeric',
                month: 'short'
            });

            card.innerHTML = `
                <div class="font-semibold text-gray-800 mb-2">${dayName}</div>
                <img src="${weatherAPI.getIconUrl(day.icon)}" alt="${day.description}" class="w-12 h-12 mx-auto mb-2">
                <div class="text-sm text-gray-600 mb-2 capitalize">${day.description}</div>
                <div class="flex justify-between text-sm">
                    <span class="text-red-500 font-medium">${day.maxTemp}°</span>
                    <span class="text-blue-500 font-medium">${day.minTemp}°</span>
                </div>
                <div class="text-xs text-gray-500 mt-1">Humidité: ${day.humidity}%</div>
            `;
            
            container.appendChild(card);
        });
    }

    // Détruire tous les graphiques
    destroyCharts() {
        if (this.temperatureChart) {
            this.temperatureChart.destroy();
            this.temperatureChart = null;
        }
        if (this.humidityChart) {
            this.humidityChart.destroy();
            this.humidityChart = null;
        }
    }
}

// Instance globale des graphiques
const weatherCharts = new WeatherCharts();
