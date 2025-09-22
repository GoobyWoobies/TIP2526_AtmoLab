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

        // Forcer le thème sombre
        const textColor = '#ffffff';
        const gridColor = 'rgba(255, 255, 255, 0.1)';
        const backgroundColor = '#000000';

        // Forcer le fond noir du canvas
        ctx.canvas.style.backgroundColor = '#000000';
        
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
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Température Min (°C)',
                        data: minTemps,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: window.innerWidth < 768 ? 1.6 : 2.5,
                backgroundColor: '#000000',
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: textColor,
                            font: {
                                size: window.innerWidth < 768 ? 9 : 12
                            }
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
                            color: textColor,
                            font: {
                                size: window.innerWidth < 768 ? 9 : 12
                            }
                        },
                        ticks: {
                            color: textColor,
                            font: {
                                size: window.innerWidth < 768 ? 8 : 11
                            }
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Jours',
                            color: textColor,
                            font: {
                                size: window.innerWidth < 768 ? 9 : 12
                            }
                        },
                        ticks: {
                            color: textColor,
                            font: {
                                size: window.innerWidth < 768 ? 8 : 11
                            }
                        },
                        grid: {
                            color: gridColor
                        }
                    }
                }
            }
        });
    }

    // Créer un magnifique graphique de précipitations en barres colorées
    createHumidityChart(canvasId, forecastData) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        // Détruire le graphique existant s'il y en a un
        if (this.humidityChart) {
            this.humidityChart.destroy();
        }

        // Créer des labels pour chaque jour
        const labels = forecastData.map(day => {
            return day.date.toLocaleDateString('fr-FR', { 
                weekday: 'short', 
                day: 'numeric'
            });
        });

        // Extraire les données de précipitations réelles de l'API (en mm)
        const precipitationData = forecastData.map(day => day.precipitation || 0);

        // Créer des couleurs dynamiques selon l'intensité des précipitations
        const getPrecipitationColor = (amount) => {
            if (amount === 0) return 'rgba(156, 163, 175, 0.8)';        // Gris - Aucune pluie
            if (amount < 2.5) return 'rgba(59, 130, 246, 0.8)';         // Bleu - Légère
            if (amount < 7.5) return 'rgba(34, 197, 94, 0.8)';         // Vert - Modérée
            if (amount < 15) return 'rgba(245, 158, 11, 0.8)';          // Orange - Forte
            if (amount < 30) return 'rgba(239, 68, 68, 0.8)';           // Rouge - Très forte
            return 'rgba(168, 85, 247, 0.8)';                          // Violet - Extrême
        };

        const precipitationColors = precipitationData.map(amount => getPrecipitationColor(amount));

        // Forcer le thème sombre
        const textColor = '#ffffff';
        const gridColor = 'rgba(255, 255, 255, 0.1)';
        const backgroundColor = '#000000';

        // Forcer le fond noir du canvas
        ctx.canvas.style.backgroundColor = '#000000';
        
        this.humidityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '🌧️ Précipitations',
                        data: precipitationData,
                        backgroundColor: precipitationColors,
                        borderColor: precipitationColors.map(color => color.replace('0.8', '1')),
                        borderWidth: 3,
                        borderRadius: 8,
                        borderSkipped: false,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: window.innerWidth < 768 ? 1.2 : 1.8,
                backgroundColor: '#000000',
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: '🌧️ Précipitations sur 5 jours',
                        color: textColor,
                        font: {
                            size: window.innerWidth < 768 ? 16 : 20,
                            weight: 'bold'
                        },
                        padding: {
                            top: 10,
                            bottom: 30
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.95)',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: 'rgba(59, 130, 246, 0.8)',
                        borderWidth: 2,
                        cornerRadius: 12,
                        displayColors: false,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13,
                            weight: 'bold'
                        },
                        callbacks: {
                            label: function(context) {
                                const amount = context.parsed.y;
                                let rainLevel = '';
                                if (amount === 0) rainLevel = ' (Sec)';
                                else if (amount < 2.5) rainLevel = ' (Légère)';
                                else if (amount < 7.5) rainLevel = ' (Modérée)';
                                else if (amount < 15) rainLevel = ' (Forte)';
                                else if (amount < 30) rainLevel = ' (Très forte)';
                                else rainLevel = ' (Extrême)';
                                
                                return `Pluie: ${amount.toFixed(1)} mm${rainLevel}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Précipitations (mm)',
                            color: textColor,
                            font: {
                                size: window.innerWidth < 768 ? 12 : 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            color: textColor,
                            font: {
                                size: window.innerWidth < 768 ? 10 : 12,
                                weight: 'bold'
                            },
                            callback: function(value) {
                                return value + ' mm';
                            }
                        },
                        grid: {
                            color: gridColor,
                            lineWidth: 1,
                            drawBorder: false
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Jours de la semaine',
                            color: textColor,
                            font: {
                                size: window.innerWidth < 768 ? 12 : 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            color: textColor,
                            font: {
                                size: window.innerWidth < 768 ? 10 : 12,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: gridColor,
                            lineWidth: 1,
                            drawBorder: false
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart',
                    delay: (context) => {
                        return context.dataIndex * 300;
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    // Créer les cartes de prévisions détaillées améliorées
    createForecastCards(containerId, forecastData) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        forecastData.forEach((day, index) => {
            const card = document.createElement('div');
            const cardClass = 'glass-effect rounded-2xl p-4 text-center border border-slate-600/30';
            
            card.className = cardClass;
            
            const dayName = day.date.toLocaleDateString('fr-FR', { 
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            });

            // Icônes météo améliorées
            const getWeatherIcon = (icon) => {
                const iconMap = {
                    '01d': '☀️', '01n': '🌙',
                    '02d': '⛅', '02n': '☁️',
                    '03d': '☁️', '03n': '☁️',
                    '04d': '☁️', '04n': '☁️',
                    '09d': '🌧️', '09n': '🌧️',
                    '10d': '🌦️', '10n': '🌧️',
                    '11d': '⛈️', '11n': '⛈️',
                    '13d': '❄️', '13n': '❄️',
                    '50d': '🌫️', '50n': '🌫️'
                };
                return iconMap[icon] || '🌤️';
            };

            // Couleurs selon la température
            const getTempColor = (temp) => {
                if (temp >= 25) return 'text-red-400';
                if (temp >= 15) return 'text-yellow-400';
                if (temp >= 5) return 'text-blue-400';
                return 'text-cyan-400';
            };

            const weatherIcon = getWeatherIcon(day.icon);
            const maxTempColor = getTempColor(day.maxTemp);
            const minTempColor = getTempColor(day.minTemp);

            card.innerHTML = `
                <!-- En-tête avec jour et icône -->
                <div class="text-center mb-3">
                    <div class="text-xs font-bold text-green-400 mb-2 uppercase tracking-wider">${dayName}</div>
                    <div class="text-6xl sm:text-7xl mb-3 leading-none">${weatherIcon}</div>
                    <div class="text-xs sm:text-sm text-slate-300 capitalize font-medium">${day.description}</div>
                </div>
                
                <!-- Températures principales -->
                <div class="mb-2">
                    <div class="flex justify-center items-center space-x-6">
                        <div class="text-center">
                            <div class="text-[10px] sm:text-xs text-slate-400 mb-0.5">MAX</div>
                            <div class="text-2xl sm:text-3xl font-bold ${maxTempColor} leading-tight">${day.maxTemp}°</div>
                        </div>
                        <div class="w-px h-10 bg-slate-600"></div>
                        <div class="text-center">
                            <div class="text-[10px] sm:text-xs text-slate-400 mb-0.5">MIN</div>
                            <div class="text-2xl sm:text-3xl font-bold ${minTempColor} leading-tight">${day.minTemp}°</div>
                        </div>
                    </div>
                </div>
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

