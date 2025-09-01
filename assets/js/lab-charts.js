// Classe pour gérer les graphiques du laboratoire météo
class LabCharts {
    constructor() {
        this.tempChart = null;
        this.humidityChart = null;
        this.initializeCharts();
    }

    // Initialiser les graphiques
    initializeCharts() {
        this.createTemperatureChart();
        this.createHumidityChart();
    }

    // Créer le graphique de température
    createTemperatureChart() {
        const ctx = document.getElementById('tempCompareChart');
        if (!ctx) {
            console.warn('Element tempCompareChart non trouvé');
            return;
        }

        this.tempChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Température (°C)',
                    data: [],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
                            text: 'Température (°C)'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Simulations'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
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

        this.humidityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Humidité (%)',
                    data: [],
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(6, 182, 212, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(139, 69, 19, 0.8)',
                        'rgba(75, 85, 99, 0.8)',
                        'rgba(16, 185, 129, 0.8)'
                    ],
                    borderColor: [
                        'rgba(34, 197, 94, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(168, 85, 247, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(6, 182, 212, 1)',
                        'rgba(236, 72, 153, 1)',
                        'rgba(139, 69, 19, 1)',
                        'rgba(75, 85, 99, 1)',
                        'rgba(16, 185, 129, 1)'
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
                            text: 'Humidité (%)'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Simulations'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
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
        if (!history || history.length === 0) {
            this.clearCharts();
            return;
        }

        // Prendre les 10 dernières simulations et les inverser pour l'affichage chronologique
        const recentHistory = history.slice(0, 10).reverse();
        
        // Créer les labels basés sur l'heure
        const labels = recentHistory.map((sim, index) => {
            const time = sim.timestamp.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            return `${index + 1} (${time})`;
        });

        // Extraire les données de température
        const temperatureData = recentHistory.map(sim => sim.params.temperature);
        
        // Extraire les données d'humidité
        const humidityData = recentHistory.map(sim => sim.params.humidity);

        // Mettre à jour le graphique de température
        if (this.tempChart) {
            this.tempChart.data.labels = labels;
            this.tempChart.data.datasets[0].data = temperatureData;
            this.tempChart.update('none'); // Animation désactivée pour de meilleures performances
            
            // Forcer le redimensionnement si nécessaire
            setTimeout(() => {
                this.tempChart.resize();
            }, 100);
        }

        // Mettre à jour le graphique d'humidité
        if (this.humidityChart) {
            this.humidityChart.data.labels = labels;
            this.humidityChart.data.datasets[0].data = humidityData;
            this.humidityChart.update('none');
            
            // Forcer le redimensionnement si nécessaire
            setTimeout(() => {
                this.humidityChart.resize();
            }, 100);
        }
    }

    // Vider les graphiques
    clearCharts() {
        if (this.tempChart) {
            this.tempChart.data.labels = [];
            this.tempChart.data.datasets[0].data = [];
            this.tempChart.update();
        }

        if (this.humidityChart) {
            this.humidityChart.data.labels = [];
            this.humidityChart.data.datasets[0].data = [];
            this.humidityChart.update();
        }
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
        if (this.tempChart) {
            this.tempChart.destroy();
            this.tempChart = null;
        }
        if (this.humidityChart) {
            this.humidityChart.destroy();
            this.humidityChart = null;
        }
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
