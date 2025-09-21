// Classe pour gérer les graphiques du laboratoire météo
class LabCharts {
    constructor() {
        this.tempChart = null;
        this.humidityChart = null;
        this.initializeCharts();
    }

    // Initialiser les graphiques
    initializeCharts() {
        // Graphiques désactivés pour le moment
        console.log('Graphiques désactivés');
    }

    // Créer le graphique de température
    createTemperatureChart() {
        const ctx = document.getElementById('tempCompareChart');
        if (!ctx) {
            console.warn('Element tempCompareChart non trouvé');
            return;
        }

        // Forcer le fond noir du canvas
        ctx.style.backgroundColor = '#000000';

        this.tempChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Température (°C)',
                    data: [],
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: false,
                resizeDelay: 0,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Température (°C)',
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Simulations',
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#ffffff'
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y}°C`;
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    // Créer le graphique d'humidité
    createHumidityChart() {
        const ctx = document.getElementById('humidityCompareChart');
        if (!ctx) {
            console.warn('Element humidityCompareChart non trouvé');
            return;
        }

        // Forcer le fond noir du canvas
        ctx.style.backgroundColor = '#000000';

        this.humidityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Humidité (%)',
                    data: [],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(52, 211, 153, 0.8)',
                        'rgba(72, 187, 120, 0.8)',
                        'rgba(56, 178, 172, 0.8)',
                        'rgba(45, 212, 191, 0.8)',
                        'rgba(20, 184, 166, 0.8)',
                        'rgba(22, 163, 74, 0.8)',
                        'rgba(5, 150, 105, 0.8)',
                        'rgba(6, 120, 95, 0.8)'
                    ],
                    borderColor: [
                        'rgba(16, 185, 129, 1)',
                        'rgba(34, 197, 94, 1)',
                        'rgba(52, 211, 153, 1)',
                        'rgba(72, 187, 120, 1)',
                        'rgba(56, 178, 172, 1)',
                        'rgba(45, 212, 191, 1)',
                        'rgba(20, 184, 166, 1)',
                        'rgba(22, 163, 74, 1)',
                        'rgba(5, 150, 105, 1)',
                        'rgba(6, 120, 95, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: false,
                resizeDelay: 0,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Humidité (%)',
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Simulations',
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#ffffff'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Mettre à jour les graphiques avec les nouvelles données
    updateCharts(history) {
        // Graphiques désactivés pour le moment
        console.log('Mise à jour des graphiques désactivée');
    }

    // Créer un graphique radar pour analyser les conditions météo
    createWeatherRadarChart() {
        const ctx = document.getElementById('weatherRadarChart');
        if (!ctx) {
            console.warn('Element weatherRadarChart non trouvé');
            return;
        }

        ctx.style.backgroundColor = '#000000';

        this.weatherRadarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Température', 'Humidité', 'Pression', 'Vent', 'Nuages', 'Précipitations'],
                datasets: [{
                    label: 'Conditions Actuelles',
                    data: [50, 50, 50, 50, 50, 50], // Valeurs par défaut
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(34, 197, 94, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(34, 197, 94, 1)',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        min: 0,
                        max: 100,
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        pointLabels: {
                            color: '#ffffff',
                            font: {
                                size: 12
                            }
                        },
                        ticks: {
                            color: '#ffffff',
                            backdropColor: 'transparent'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#ffffff'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const labels = ['Température', 'Humidité', 'Pression', 'Vent', 'Nuages', 'Précipitations'];
                                return `${labels[context.dataIndex]}: ${context.parsed.r}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Créer un graphique en jauge pour la température
    createWeatherGaugeChart() {
        const ctx = document.getElementById('weatherGaugeChart');
        if (!ctx) {
            console.warn('Element weatherGaugeChart non trouvé');
            return;
        }

        ctx.style.backgroundColor = '#000000';

        this.weatherGaugeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Température', 'Confort'],
                datasets: [{
                    data: [50, 50],
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(45, 45, 45, 0.8)'
                    ],
                    borderColor: [
                        'rgba(34, 197, 94, 1)',
                        'rgba(45, 45, 45, 1)'
                    ],
                    borderWidth: 2,
                    cutout: '70%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 1000
                }
            }
        });
    }

    // Mettre à jour le graphique radar avec les paramètres actuels
    updateWeatherRadarChart(params) {
        if (!this.weatherRadarChart || !params) return;

        const data = [
            this.normalizeValue(params.temperature, -20, 45),
            params.humidity,
            this.normalizeValue(params.pressure, 950, 1050),
            this.normalizeValue(params.windSpeed, 0, 120),
            params.cloudCover,
            this.normalizeValue(params.precipitation, 0, 50)
        ];

        this.weatherRadarChart.data.datasets[0].data = data;
        this.weatherRadarChart.update('active');
    }

    // Mettre à jour le graphique jauge avec les paramètres actuels
    updateWeatherGaugeChart(params) {
        if (!this.weatherGaugeChart || !params) return;

        // Calculer un indice de confort basé sur la température et l'humidité
        const comfortIndex = this.calculateComfortIndex(params.temperature, params.humidity);
        const tempValue = this.normalizeValue(params.temperature, -20, 45);
        
        this.weatherGaugeChart.data.datasets[0].data = [tempValue, 100 - tempValue];
        this.weatherGaugeChart.update('active');
    }

    // Calculer un indice de confort
    calculateComfortIndex(temperature, humidity) {
        // Indice de confort basé sur la température et l'humidité
        let comfort = 100;
        
        // Pénalité pour températures extrêmes
        if (temperature < 0 || temperature > 35) comfort -= 30;
        else if (temperature < 5 || temperature > 30) comfort -= 15;
        else if (temperature < 10 || temperature > 25) comfort -= 5;
        
        // Pénalité pour humidité extrême
        if (humidity < 20 || humidity > 90) comfort -= 20;
        else if (humidity < 30 || humidity > 80) comfort -= 10;
        
        return Math.max(0, Math.min(100, comfort));
    }

    // Vider les graphiques
    clearCharts() {
        // Graphiques désactivés pour le moment
        console.log('Nettoyage des graphiques désactivé');
    }

    // Ajouter une comparaison avec des données réelles (si disponible)
    addRealDataComparison(realData) {
        if (!this.tempChart || !realData) return;

        // Ajouter un dataset pour les données réelles si pas déjà présent
        const hasRealData = this.tempChart.data.datasets.find(dataset => dataset.label.includes('Réelles'));
        
        if (!hasRealData && realData.length > 0) {
            this.tempChart.data.datasets.push({
                label: 'Températures Réelles (°C)',
                data: realData.map(d => d.temperature),
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                tension: 0.4
            });
            this.tempChart.update();
        }
    }

    // Créer un graphique de radar pour analyser les conditions météo
    createRadarChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        return new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Température', 'Humidité', 'Pression', 'Vent', 'Confort'],
                datasets: [{
                    label: 'Conditions Actuelles',
                    data: [
                        this.normalizeValue(data.temperature, -20, 45),
                        data.humidity,
                        this.normalizeValue(data.pressure, 950, 1050),
                        this.normalizeValue(data.windSpeed, 0, 120),
                        data.comfortIndex || 50
                    ],
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            display: true
                        },
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    // Normaliser une valeur entre 0 et 100
    normalizeValue(value, min, max) {
        return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
    }

    // Détruire les graphiques (nettoyage)
    destroy() {
        // Graphiques désactivés pour le moment
        console.log('Destruction des graphiques désactivée');
    }

    // Exporter les données des graphiques
    exportChartData() {
        const data = {
            temperature: this.tempChart ? this.tempChart.data : null,
            humidity: this.humidityChart ? this.humidityChart.data : null,
            timestamp: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `meteo-lab-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // Importer des données dans les graphiques
    importChartData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.temperature && this.tempChart) {
                this.tempChart.data = data.temperature;
                this.tempChart.update();
            }
            if (data.humidity && this.humidityChart) {
                this.humidityChart.data = data.humidity;
                this.humidityChart.update();
            }
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'import des données:', error);
            return false;
        }
    }
}

// Instance globale
let labCharts = null;

// Initialiser les graphiques quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que Chart.js soit chargé
    if (typeof Chart !== 'undefined') {
        initializeCharts();
    } else {
        // Retry après un court délai si Chart.js n'est pas encore chargé
        setTimeout(() => {
            if (typeof Chart !== 'undefined') {
                initializeCharts();
            } else {
                console.error('Chart.js n\'est pas chargé. Vérifiez que le script est inclus.');
            }
        }, 100);
    }
});

function initializeCharts() {
    try {
        labCharts = new LabCharts();
        window.labCharts = labCharts; // Rendre accessible globalement
        console.log('📊 Graphiques du laboratoire initialisés');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des graphiques:', error);
    }
}

// Rendre la fonction accessible globalement
window.initializeCharts = initializeCharts;
