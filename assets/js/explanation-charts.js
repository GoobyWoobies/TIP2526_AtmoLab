/**
 * Graphiques Chart.js pour les pages d'explications
 * Seulement les graphiques vraiment utiles pédagogiquement
 */

class ExplanationCharts {
    
    /**
     * Graphique composition de l'air (Page Bases - section 2.1)
     */
    static createCompositionChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        // Forcer le fond noir du canvas
        ctx.style.backgroundColor = '#000000';
        
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Azote (N₂)', 'Oxygène (O₂)', 'Argon (Ar)', 'CO₂ + gaz traces'],
                datasets: [{
                    data: [78.08, 20.95, 0.93, 0.04],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',   // Vert principal
                        'rgba(34, 197, 94, 0.8)',    // Vert moyen
                        'rgba(52, 211, 153, 0.8)',   // Vert clair
                        'rgba(72, 187, 120, 0.8)'    // Vert foncé
                    ],
                    borderColor: [
                        'rgba(16, 185, 129, 1)',
                        'rgba(34, 197, 94, 1)',
                        'rgba(52, 211, 153, 1)',
                        'rgba(72, 187, 120, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        bottom: 20
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            font: {
                                size: 11
                            },
                            padding: 12,
                            boxWidth: 12
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Graphique pression vs altitude (Page Bases - section 2.3)
     */
    static createPressureChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        // Forcer le fond noir du canvas
        ctx.style.backgroundColor = '#000000';
        
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Niveau mer', '1500m (Alpes)', '3000m (Hautes montagnes)', '5500m (Mont Blanc)', '10000m (Avions)'],
                datasets: [{
                    label: 'Pression atmosphérique (hPa)',
                    data: [1013, 850, 700, 500, 265],
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgb(34, 197, 94)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Pression (hPa)',
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
                            text: 'Altitude',
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff',
                            maxRotation: 45
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Pression: ' + context.parsed.y + ' hPa';
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Graphique échelle de Beaufort (Page Phénomènes - section 3.3)
     */
    static createBeaufortChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        // Forcer le fond noir du canvas
        ctx.style.backgroundColor = '#000000';
        
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Force 0\nCalme', 'Force 3\nPetite brise', 'Force 6\nVent frais', 'Force 8\nCoup de vent', 'Force 12\nOuragan'],
                datasets: [{
                    label: 'Vitesse du vent (km/h)',
                    data: [1, 19, 49, 74, 118],
                    backgroundColor: [
                        'rgba(134, 247, 196, 0.8)',  // Très clair
                        'rgba(82, 244, 157, 0.8)',   // Clair
                        'rgba(52, 211, 153, 0.8)',   // Moyen
                        'rgba(16, 185, 129, 0.8)',   // Foncé
                        'rgba(6, 95, 70, 0.8)'       // Très foncé
                    ],
                    borderColor: [
                        'rgba(134, 247, 196, 1)',
                        'rgba(82, 244, 157, 1)',
                        'rgba(52, 211, 153, 1)',
                        'rgba(16, 185, 129, 1)',
                        'rgba(6, 95, 70, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Vitesse (km/h)',
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
                            text: 'Échelle de Beaufort',
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
                        labels: {
                            color: '#ffffff'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + ' km/h';
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Graphique capacité de saturation air/température (Page Eau - section 4.5)
     */
    static createSaturationChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        // Forcer le fond noir du canvas
        ctx.style.backgroundColor = '#000000';
        
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['-10°C', '0°C', '10°C', '20°C', '30°C', '40°C'],
                datasets: [{
                    label: 'Capacité max de vapeur d\'eau (g/m³)',
                    data: [2.3, 4.8, 9.4, 17.3, 30.4, 51.1],
                    borderColor: 'rgb(52, 211, 153)',
                    backgroundColor: 'rgba(52, 211, 153, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgb(52, 211, 153)',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Vapeur d\'eau (g/m³)',
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
                            text: 'Température',
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
                        labels: {
                            color: '#ffffff'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + ' g/m³ à ' + context.label;
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Graphique diagramme psychrométrique simplifié (Page Bases - section 2.4)
     */
    static createPsychrometricChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        // Forcer le fond noir du canvas
        ctx.style.backgroundColor = '#000000';
        
        // Données simplifiées pour différentes températures et humidités relatives
        const datasets = [];
        const humidityLevels = [20, 40, 60, 80, 100];
        const colors = [
            'rgba(6, 120, 95, 0.8)',
            'rgba(22, 163, 74, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(52, 211, 153, 0.8)',
            'rgba(134, 247, 196, 0.8)'
        ];
        
        humidityLevels.forEach((humidity, index) => {
            const data = [];
            for (let temp = 0; temp <= 40; temp += 5) {
                // Calcul approximatif de l'humidité absolue
                const saturationPressure = 6.112 * Math.exp((17.67 * temp) / (temp + 243.5));
                const actualPressure = saturationPressure * (humidity / 100);
                const absoluteHumidity = (actualPressure * 216.7) / (temp + 273.15);
                data.push({x: temp, y: absoluteHumidity});
            }
            
            datasets.push({
                label: humidity + '% HR',
                data: data,
                borderColor: colors[index],
                backgroundColor: colors[index].replace('0.8', '0.1'),
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 3
            });
        });
        
        return new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Humidité absolue (g/m³)',
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
                        type: 'linear',
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
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + ' g/m³';
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Graphique Wind Chill et Heat Index (Page Prévision - section 6.3)
     */
    static createFeelsLikeChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        ctx.style.backgroundColor = '#000000';
        
        // Données Wind Chill (température vs vent à 20 km/h)
        const windChillData = [];
        for (let temp = 10; temp >= -40; temp -= 5) {
            const windSpeed = 20; // km/h
            const wci = 13.12 + 0.6215 * temp - 11.37 * Math.pow(windSpeed, 0.16) + 0.3965 * temp * Math.pow(windSpeed, 0.16);
            windChillData.push({x: temp, y: wci});
        }
        
        // Données Heat Index (température vs 60% humidité)
        const heatIndexData = [];
        for (let tempF = 80; tempF <= 110; tempF += 2) {
            const humidity = 60; // %
            const hi = -42.379 + 2.04901523 * tempF + 10.14333127 * humidity 
                      - 0.22475541 * tempF * humidity - 6.83783e-3 * tempF * tempF
                      - 5.481717e-2 * humidity * humidity + 1.22874e-3 * tempF * tempF * humidity
                      + 8.5282e-4 * tempF * humidity * humidity - 1.99e-6 * tempF * tempF * humidity * humidity;
            const tempC = (tempF - 32) * 5/9;
            const hiC = (hi - 32) * 5/9;
            heatIndexData.push({x: tempC, y: hiC});
        }
        
        return new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Wind Chill (vent 20 km/h)',
                    data: windChillData,
                    borderColor: '#34d399',
                    backgroundColor: 'rgba(52, 211, 153, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                }, {
                    label: 'Heat Index (60% humidité)',
                    data: heatIndexData,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Température réelle (°C)',
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Température ressentie (°C)',
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
                        labels: {
                            color: '#ffffff'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + '°C';
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Graphique production éolienne (Page Applications - section 8.3)
     */
    static createWindPowerChart(canvasId) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        ctx.style.backgroundColor = '#000000';
        
        // Courbe de puissance typique d'une éolienne
        const windData = [];
        for (let wind = 0; wind <= 25; wind += 0.5) {
            let power = 0;
            if (wind >= 3 && wind <= 25) {
                if (wind <= 12) {
                    // Phase de montée cubique
                    power = Math.pow(wind / 12, 3) * 100;
                } else if (wind <= 20) {
                    // Puissance nominale
                    power = 100;
                } else {
                    // Décroissance linéaire jusqu'à arrêt
                    power = 100 - (wind - 20) * 20;
                }
            }
            windData.push({x: wind, y: Math.max(0, power)});
        }
        
        return new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Production éolienne (%)',
                    data: windData,
                    borderColor: '#34d399',
                    backgroundColor: 'rgba(52, 211, 153, 0.2)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Vitesse du vent (m/s)',
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        },
                        min: 0,
                        max: 25
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Puissance nominale (%)',
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        },
                        min: 0,
                        max: 110
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Puissance: ' + context.parsed.y.toFixed(1) + '% à ' + context.parsed.x + ' m/s';
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Initialise tous les graphiques sur une page
     */
    static initializePageCharts(page) {
        // Attendre que Chart.js soit chargé
        if (typeof Chart === 'undefined') {
            setTimeout(() => ExplanationCharts.initializePageCharts(page), 100);
            return;
        }
        
        switch(page) {
            case 'bases':
                ExplanationCharts.createCompositionChart('compositionChart');
                ExplanationCharts.createPressureChart('pressureChart');
                ExplanationCharts.createPsychrometricChart('psychrometricChart');
                break;
            case 'phenomenes':
                ExplanationCharts.createBeaufortChart('beaufortChart');
                break;
            case 'eau':
                ExplanationCharts.createSaturationChart('saturationChart');
                break;
            case 'prevision':
                ExplanationCharts.createFeelsLikeChart('feelsLikeChart');
                break;
            case 'applications':
                ExplanationCharts.createWindPowerChart('windPowerChart');
                break;
        }
    }
}

// Auto-initialisation selon la page
document.addEventListener('DOMContentLoaded', function() {
    const url = window.location.pathname;
    
    if (url.includes('bases-atmosphere')) {
        ExplanationCharts.initializePageCharts('bases');
    } else if (url.includes('phenomenes')) {
        ExplanationCharts.initializePageCharts('phenomenes');
    } else if (url.includes('eau')) {
        ExplanationCharts.initializePageCharts('eau');
    } else if (url.includes('prevision')) {
        ExplanationCharts.initializePageCharts('prevision');
    } else if (url.includes('applications')) {
        ExplanationCharts.initializePageCharts('applications');
    }
});
