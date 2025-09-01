// Classe pour gérer la simulation météorologique
class WeatherSimulation {
    constructor() {
        this.currentParams = {
            temperature: 20,
            humidity: 60,
            pressure: 1013,
            windSpeed: 10,
            windDirection: 0
        };
        
        this.history = [];
        this.presets = {
            sunny: {
                temperature: 28,
                humidity: 45,
                pressure: 1020,
                windSpeed: 8,
                windDirection: 180,
                name: "Journée ensoleillée"
            },
            rainy: {
                temperature: 15,
                humidity: 85,
                pressure: 995,
                windSpeed: 25,
                windDirection: 270,
                name: "Temps pluvieux"
            },
            stormy: {
                temperature: 22,
                humidity: 90,
                pressure: 980,
                windSpeed: 65,
                windDirection: 225,
                name: "Orage"
            },
            winter: {
                temperature: -5,
                humidity: 70,
                pressure: 1025,
                windSpeed: 15,
                windDirection: 45,
                name: "Temps hivernal"
            },
            heatwave: {
                temperature: 42,
                humidity: 25,
                pressure: 1008,
                windSpeed: 5,
                windDirection: 90,
                name: "Canicule"
            }
        };
    }

    // Mettre à jour les paramètres
    updateParameter(param, value) {
        this.currentParams[param] = parseFloat(value);
        this.updateDisplay();
    }

    // Appliquer un preset
    applyPreset(presetName) {
        const preset = this.presets[presetName];
        if (preset) {
            this.currentParams = { ...preset };
            this.updateSliders();
            this.updateDisplay();
        }
    }

    // Mettre à jour l'affichage des valeurs
    updateDisplay() {
        document.getElementById('tempValue').textContent = `${this.currentParams.temperature}°C`;
        document.getElementById('humidityValue').textContent = `${this.currentParams.humidity}%`;
        document.getElementById('pressureValue').textContent = `${this.currentParams.pressure} hPa`;
        document.getElementById('windValue').textContent = `${this.currentParams.windSpeed} km/h`;
        document.getElementById('windDirValue').textContent = this.getWindDirection(this.currentParams.windDirection);
    }

    // Mettre à jour les sliders
    updateSliders() {
        document.getElementById('tempSlider').value = this.currentParams.temperature;
        document.getElementById('humiditySlider').value = this.currentParams.humidity;
        document.getElementById('pressureSlider').value = this.currentParams.pressure;
        document.getElementById('windSlider').value = this.currentParams.windSpeed;
        document.getElementById('windDirSlider').value = this.currentParams.windDirection;
    }

    // Convertir les degrés en direction cardinale
    getWindDirection(degrees) {
        const directions = ['Nord', 'Nord-Est', 'Est', 'Sud-Est', 'Sud', 'Sud-Ouest', 'Ouest', 'Nord-Ouest'];
        const index = Math.round(degrees / 45) % 8;
        return directions[index];
    }

    // Lancer la simulation
    runSimulation() {
        const simulation = {
            timestamp: new Date(),
            params: { ...this.currentParams },
            results: this.calculateWeatherEffects()
        };

        this.history.unshift(simulation);
        if (this.history.length > 10) {
            this.history.pop(); // Garder seulement les 10 dernières simulations
        }

        this.displaySimulationResults(simulation);
        this.updateHistory();
        this.updateCharts();

        return simulation;
    }

    // Calculer les effets météorologiques
    calculateWeatherEffects() {
        const { temperature, humidity, pressure, windSpeed, windDirection } = this.currentParams;
        
        // Déterminer le type de temps
        let weatherType = this.determineWeatherType(temperature, humidity, pressure, windSpeed);
        
        // Calculer l'indice de confort
        let comfortIndex = this.calculateComfortIndex(temperature, humidity, windSpeed);
        
        // Calculer les risques
        let risks = this.calculateRisks(temperature, humidity, pressure, windSpeed);
        
        // Recommandations
        let recommendations = this.generateRecommendations(weatherType, comfortIndex, risks);
        
        // Prévisions d'évolution
        let evolution = this.predictEvolution(temperature, humidity, pressure, windSpeed);

        return {
            weatherType,
            comfortIndex,
            risks,
            recommendations,
            evolution,
            emoji: this.getWeatherEmoji(weatherType),
            description: this.getWeatherDescription(weatherType)
        };
    }

    // Déterminer le type de temps
    determineWeatherType(temp, humidity, pressure, wind) {
        if (pressure < 985) {
            if (wind > 50) return 'storm';
            if (humidity > 80) return 'heavy_rain';
            return 'rain';
        }
        
        if (temp < 0) {
            if (humidity > 75) return 'snow';
            return 'frost';
        }
        
        if (temp > 35) {
            if (humidity < 30) return 'hot_dry';
            return 'hot_humid';
        }
        
        if (pressure > 1020 && humidity < 60) return 'sunny';
        if (humidity > 80) return 'cloudy';
        
        return 'partly_cloudy';
    }

    // Calculer l'indice de confort
    calculateComfortIndex(temp, humidity, wind) {
        // Formule simplifiée de l'indice de confort thermique
        let heatIndex = temp + (0.33 * (humidity / 100) * 6.105 * Math.exp(17.27 * temp / (237.7 + temp))) - 0.7 * wind - 4;
        
        if (heatIndex < 10) return { level: 'froid', score: Math.max(0, heatIndex + 10) };
        if (heatIndex < 18) return { level: 'frais', score: 40 + (heatIndex - 10) * 3 };
        if (heatIndex < 24) return { level: 'confortable', score: 70 + (heatIndex - 18) * 5 };
        if (heatIndex < 30) return { level: 'chaud', score: 100 - (heatIndex - 24) * 5 };
        return { level: 'très chaud', score: Math.max(0, 100 - (heatIndex - 30) * 8) };
    }

    // Calculer les risques météorologiques
    calculateRisks(temp, humidity, pressure, wind) {
        let risks = [];
        
        if (wind > 60) risks.push({ type: 'Vent violent', level: 'élevé', description: 'Risque de chutes d\'objets et difficultés de déplacement' });
        if (wind > 40) risks.push({ type: 'Vent fort', level: 'modéré', description: 'Prudence en extérieur' });
        
        if (temp > 35 && humidity > 60) risks.push({ type: 'Chaleur humide', level: 'élevé', description: 'Risque de malaise, hydratation nécessaire' });
        if (temp > 30) risks.push({ type: 'Forte chaleur', level: 'modéré', description: 'Éviter l\'exposition prolongée au soleil' });
        
        if (temp < -10) risks.push({ type: 'Froid extrême', level: 'élevé', description: 'Risque d\'hypothermie et de gelures' });
        if (temp < 0) risks.push({ type: 'Gel', level: 'modéré', description: 'Attention aux surfaces glissantes' });
        
        if (pressure < 980) risks.push({ type: 'Tempête', level: 'élevé', description: 'Conditions météo très dégradées' });
        if (humidity > 90 && temp > 0) risks.push({ type: 'Brouillard', level: 'modéré', description: 'Visibilité réduite' });
        
        return risks;
    }

    // Générer des recommandations
    generateRecommendations(weatherType, comfort, risks) {
        let recommendations = [];
        
        switch (weatherType) {
            case 'sunny':
                recommendations.push('Profitez du beau temps pour les activités extérieures');
                recommendations.push('N\'oubliez pas la protection solaire');
                break;
            case 'rain':
            case 'heavy_rain':
                recommendations.push('Prenez un parapluie ou un imperméable');
                recommendations.push('Évitez les zones inondables');
                break;
            case 'storm':
                recommendations.push('Restez à l\'intérieur autant que possible');
                recommendations.push('Évitez les arbres et structures instables');
                break;
            case 'snow':
                recommendations.push('Équipez-vous pour la neige et le froid');
                recommendations.push('Conduisez prudemment sur routes glissantes');
                break;
            case 'hot_dry':
                recommendations.push('Hydratez-vous régulièrement');
                recommendations.push('Évitez les efforts physiques intenses');
                break;
        }
        
        if (comfort.level === 'froid' || comfort.level === 'frais') {
            recommendations.push('Habillez-vous chaudement');
        }
        
        if (risks.length > 0) {
            recommendations.push('Consultez les alertes météo locales');
        }
        
        return recommendations;
    }

    // Prédire l'évolution
    predictEvolution(temp, humidity, pressure, wind) {
        let trends = [];
        
        if (pressure < 1000) {
            trends.push('La pression basse indique une dégradation possible');
        } else if (pressure > 1020) {
            trends.push('La haute pression favorise le beau temps');
        }
        
        if (humidity > 80) {
            trends.push('L\'humidité élevée peut conduire à des précipitations');
        }
        
        if (wind > 30) {
            trends.push('Le vent fort peut s\'intensifier ou se calmer rapidement');
        }
        
        return trends;
    }

    // Obtenir l'emoji météo
    getWeatherEmoji(weatherType) {
        const emojis = {
            sunny: '☀️',
            partly_cloudy: '⛅',
            cloudy: '☁️',
            rain: '🌧️',
            heavy_rain: '⛈️',
            storm: '🌩️',
            snow: '❄️',
            frost: '🧊',
            hot_dry: '🔥',
            hot_humid: '🥵'
        };
        return emojis[weatherType] || '🌤️';
    }

    // Obtenir la description météo
    getWeatherDescription(weatherType) {
        const descriptions = {
            sunny: 'Ensoleillé',
            partly_cloudy: 'Partiellement nuageux',
            cloudy: 'Nuageux',
            rain: 'Pluvieux',
            heavy_rain: 'Fortes précipitations',
            storm: 'Orageux',
            snow: 'Neigeux',
            frost: 'Gel',
            hot_dry: 'Chaud et sec',
            hot_humid: 'Chaud et humide'
        };
        return descriptions[weatherType] || 'Conditions variables';
    }

    // Afficher les résultats de simulation
    displaySimulationResults(simulation) {
        const results = simulation.results;
        
        // Masquer le message de bienvenue et afficher les résultats
        document.getElementById('welcomeMessage').classList.add('hidden');
        document.getElementById('simulationResults').classList.remove('hidden');
        
        // Mettre à jour l'affichage principal
        document.getElementById('weatherEmoji').textContent = results.emoji;
        document.getElementById('simTemp').textContent = `${simulation.params.temperature}°C`;
        document.getElementById('simCondition').textContent = results.description;
        
        // Mettre à jour les détails
        document.getElementById('simHumidity').textContent = `${simulation.params.humidity}%`;
        document.getElementById('simPressure').textContent = `${simulation.params.pressure} hPa`;
        document.getElementById('simWind').textContent = `${simulation.params.windSpeed} km/h`;
        document.getElementById('simWindDir').textContent = this.getWindDirection(simulation.params.windDirection);
        
        // Afficher l'analyse
        this.displayAnalysis(results);
    }

    // Afficher l'analyse détaillée
    displayAnalysis(results) {
        let analysisHTML = `
            <div class="mb-3">
                <span class="font-medium">Confort thermique:</span> 
                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">${results.comfortIndex.level}</span>
                <span class="text-sm text-gray-600">(${results.comfortIndex.score}/100)</span>
            </div>
        `;
        
        if (results.risks.length > 0) {
            analysisHTML += '<div class="mb-3"><span class="font-medium">Risques identifiés:</span><ul class="mt-1 space-y-1">';
            results.risks.forEach(risk => {
                const colorClass = risk.level === 'élevé' ? 'text-red-600' : 'text-yellow-600';
                analysisHTML += `<li class="text-sm ${colorClass}">• ${risk.type}: ${risk.description}</li>`;
            });
            analysisHTML += '</ul></div>';
        }
        
        if (results.recommendations.length > 0) {
            analysisHTML += '<div class="mb-3"><span class="font-medium">Recommandations:</span><ul class="mt-1 space-y-1">';
            results.recommendations.forEach(rec => {
                analysisHTML += `<li class="text-sm text-gray-700">• ${rec}</li>`;
            });
            analysisHTML += '</ul></div>';
        }
        
        if (results.evolution.length > 0) {
            analysisHTML += '<div><span class="font-medium">Tendances:</span><ul class="mt-1 space-y-1">';
            results.evolution.forEach(trend => {
                analysisHTML += `<li class="text-sm text-gray-700">• ${trend}</li>`;
            });
            analysisHTML += '</ul></div>';
        }
        
        document.getElementById('weatherAnalysis').innerHTML = analysisHTML;
    }

    // Mettre à jour l'historique
    updateHistory() {
        const historyContainer = document.getElementById('simulationHistory');
        
        if (this.history.length === 0) {
            historyContainer.innerHTML = '<p class="text-gray-500 text-sm">Aucune simulation encore...</p>';
            return;
        }
        
        let historyHTML = '';
        this.history.forEach((sim, index) => {
            const time = sim.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            historyHTML += `
                <div class="text-xs bg-gray-50 p-2 rounded">
                    <div class="flex justify-between items-center">
                        <span class="font-medium">${time}</span>
                        <span>${sim.results.emoji}</span>
                    </div>
                    <div class="text-gray-600">
                        ${sim.params.temperature}°C, ${sim.params.humidity}%, ${sim.params.pressure}hPa
                    </div>
                </div>
            `;
        });
        
        historyContainer.innerHTML = historyHTML;
    }

    // Effacer l'historique
    clearHistory() {
        this.history = [];
        this.updateHistory();
        this.updateCharts();
    }

    // Méthode pour mettre à jour les graphiques (sera appelée par lab-charts.js)
    updateCharts() {
        if (window.labCharts) {
            window.labCharts.updateCharts(this.history);
        }
    }

    // Obtenir les données pour les graphiques
    getChartData() {
        return {
            history: this.history,
            currentParams: this.currentParams
        };
    }
}

// Instance globale
const weatherSimulation = new WeatherSimulation();
