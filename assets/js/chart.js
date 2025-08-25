// Weather Chart functionality using Chart.js
const WeatherChart = {
    chart: null,
    
    // Initialize the chart with default data
    initChart: function() {
        const canvas = document.getElementById('forecastChart');
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.chart) {
            this.chart.destroy();
        }
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['En attente...'],
                datasets: [{
                    label: 'Température (°C)',
                    data: [0],
                    borderColor: '#E5E7EB',
                    backgroundColor: 'rgba(229, 231, 235, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#E5E7EB',
                    pointBorderColor: '#374151',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }, {
                    label: 'Humidité (%)',
                    data: [0],
                    borderColor: '#60A5FA',
                    backgroundColor: 'rgba(96, 165, 250, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#60A5FA',
                    pointBorderColor: '#1E40AF',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: 20
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 14,
                                weight: '600',
                                family: 'Inter, sans-serif'
                            },
                            color: '#9CA3AF'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(31, 41, 55, 0.95)',
                        titleColor: '#F9FAFB',
                        bodyColor: '#F9FAFB',
                        borderColor: '#6B7280',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },
                            label: function(context) {
                                if (context.datasetIndex === 0) {
                                    return `🌡️ ${Math.round(context.parsed.y)}°C`;
                                } else {
                                    return `💧 ${Math.round(context.parsed.y)}%`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Jours',
                            font: {
                                size: 14,
                                weight: '600',
                                family: 'Inter, sans-serif'
                            },
                            color: '#9CA3AF'
                        },
                        grid: {
                            color: 'rgba(75, 85, 99, 0.3)',
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                size: 12,
                                weight: '500'
                            },
                            color: '#9CA3AF',
                            maxRotation: 45
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Température (°C)',
                            font: {
                                size: 14,
                                weight: '600',
                                family: 'Inter, sans-serif'
                            },
                            color: '#9CA3AF'
                        },
                        grid: {
                            color: 'rgba(75, 85, 99, 0.3)',
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                size: 12,
                                weight: '500'
                            },
                            color: '#9CA3AF',
                            callback: function(value) {
                                return Math.round(value) + '°C';
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Humidité (%)',
                            font: {
                                size: 14,
                                weight: '600',
                                family: 'Inter, sans-serif'
                            },
                            color: '#60A5FA'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            font: {
                                size: 12,
                                weight: '500'
                            },
                            color: '#60A5FA',
                            callback: function(value) {
                                return Math.round(value) + '%';
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        hoverBorderWidth: 3
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    },
    
    // Update chart with forecast data (5-day forecast)
    updateChart: function(forecastData) {
        if (!this.chart) {
            this.initChart();
        }
        
        // Process forecast data for next 5 days
        const dailyData = this.processDailyForecastData(forecastData);
        
        // Update chart data
        this.chart.data.labels = dailyData.labels;
        this.chart.data.datasets[0].data = dailyData.temperatures;
        this.chart.data.datasets[1].data = dailyData.humidity;
        
        // Update the chart
        this.chart.update('active');
        
        console.log('📊 Graphique mis à jour avec les prévisions sur 5 jours');
        console.log('Données:', dailyData);
    },
    
    // Process forecast data for 5-day display
    processDailyForecastData: function(forecastData) {
        const labels = [];
        const temperatures = [];
        const humidity = [];
        
        // OpenWeatherMap API returns data every 3 hours for 5 days (40 entries)
        // We'll take one entry per day (every 8th entry for midday temperatures)
        const dailyIndices = [0, 8, 16, 24, 32]; // Roughly midday for each of the 5 days
        
        for (let i = 0; i < dailyIndices.length && dailyIndices[i] < forecastData.list.length; i++) {
            const index = dailyIndices[i];
            const forecast = forecastData.list[index];
            
            if (!forecast) continue;
            
            const date = new Date(forecast.dt * 1000);
            const temp = forecast.main.temp;
            const hum = forecast.main.humidity;
            
            // Format date for Swiss locale (day + month)
            const dayLabel = date.toLocaleDateString('fr-CH', { 
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            });
            
            labels.push(dayLabel);
            temperatures.push(Math.round(temp));
            humidity.push(Math.round(hum));
        }
        
        // If we don't have enough data, try a different approach
        if (labels.length < 3) {
            return this.processDailyForecastDataAlternative(forecastData);
        }
        
        return {
            labels,
            temperatures,
            humidity
        };
    },
    
    // Alternative method to process forecast data if the first method doesn't work
    processDailyForecastDataAlternative: function(forecastData) {
        const labels = [];
        const temperatures = [];
        const humidity = [];
        
        // Group data by day and take average/representative values
        const dailyGroups = {};
        
        forecastData.list.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const dayKey = date.toDateString();
            
            if (!dailyGroups[dayKey]) {
                dailyGroups[dayKey] = {
                    date: date,
                    temps: [],
                    humidities: []
                };
            }
            
            dailyGroups[dayKey].temps.push(forecast.main.temp);
            dailyGroups[dayKey].humidities.push(forecast.main.humidity);
        });
        
        // Take up to 5 days
        const days = Object.keys(dailyGroups).slice(0, 5);
        
        days.forEach(dayKey => {
            const group = dailyGroups[dayKey];
            
            // Calculate average temperature and humidity for the day
            const avgTemp = group.temps.reduce((a, b) => a + b, 0) / group.temps.length;
            const avgHumidity = group.humidities.reduce((a, b) => a + b, 0) / group.humidities.length;
            
            const dayLabel = group.date.toLocaleDateString('fr-CH', { 
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            });
            
            labels.push(dayLabel);
            temperatures.push(Math.round(avgTemp));
            humidity.push(Math.round(avgHumidity));
        });
        
        return {
            labels,
            temperatures,
            humidity
        };
    },
    
    // Destroy chart instance
    destroyChart: function() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
};