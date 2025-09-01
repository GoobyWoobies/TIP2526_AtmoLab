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

        // Détecter le mode sombre
        const isDarkMode = document.body.classList.contains('dark');
        const textColor = isDarkMode ? '#ffffff' : '#374151';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const backgroundColor = isDarkMode ? '#000000' : '#ffffff';

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
                backgroundColor: backgroundColor,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: textColor
                        }
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
                            text: 'Température (°C)',
                            color: textColor
                        },
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Jours',
                            color: textColor
                        },
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            color: gridColor
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

        // Détecter le mode sombre
        const isDarkMode = document.body.classList.contains('dark');
        const textColor = isDarkMode ? '#ffffff' : '#374151';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const backgroundColor = isDarkMode ? '#000000' : '#ffffff';

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
                backgroundColor: backgroundColor,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: textColor
                        }
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
                            text: 'Humidité (%)',
                            color: textColor
                        },
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Jours',
                            color: textColor
                        },
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            color: gridColor
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
            // Détecter le mode sombre pour les cartes
            const isDarkMode = document.body.classList.contains('dark');
            const cardClass = 'glass-effect rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1';
            
            card.className = cardClass;
            
            const dayName = day.date.toLocaleDateString('fr-FR', { 
                weekday: 'long',
                day: 'numeric',
                month: 'short'
            });

            const titleClass = isDarkMode ? 'font-bold text-white mb-4 text-sm uppercase tracking-wide' : 'font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide';
            const descClass = isDarkMode ? 'text-sm text-slate-300 mb-4 capitalize font-medium' : 'text-sm text-slate-600 mb-4 capitalize font-medium';
            const tempClass = isDarkMode ? 'flex justify-between text-lg mb-3 font-bold text-white' : 'flex justify-between text-lg mb-3 font-bold text-slate-800';
            const humidityClass = isDarkMode ? 'text-xs text-slate-300 bg-black/30 rounded-full px-3 py-1' : 'text-xs text-slate-500 bg-slate-100/50 rounded-full px-3 py-1';

            card.innerHTML = `
                <div class="${titleClass}">${dayName}</div>
                <img src="${weatherAPI.getIconUrl(day.icon)}" alt="${day.description}" class="w-24 h-24 mx-auto mb-4 drop-shadow-lg">
                <div class="${descClass}">${day.description}</div>
                <div class="${tempClass}">
                    <span class="text-red-500">${day.maxTemp}°</span>
                    <span class="text-blue-500">${day.minTemp}°</span>
                </div>
                <div class="${humidityClass}">Humidité: ${day.humidity}%</div>
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
