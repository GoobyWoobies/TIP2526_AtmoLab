// Application principale du laboratoire météorologique
class MeteoLab {
    constructor() {
        this.map = null;
        this.initializeApp();
    }

    // Initialiser l'application
    initializeApp() {
        this.bindEvents();
        this.initializeMap();
        this.initializeSliders();
        this.showWelcomeAnimation();
    }

    // Lier les événements
    bindEvents() {
        // Sliders de paramètres
        this.bindSliderEvents();
        
        // Bouton de simulation
        const simulateBtn = document.getElementById('simulateBtn');
        if (simulateBtn) {
            simulateBtn.addEventListener('click', () => this.runSimulation());
        }

        // Boutons de presets
        const presetBtns = document.querySelectorAll('.preset-btn');
        presetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.getAttribute('data-preset');
                this.applyPreset(preset);
            });
        });

        // Bouton d'effacement de l'historique
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        }

        // Bouton de test des graphiques
        const testChartsBtn = document.getElementById('testChartsBtn');
        if (testChartsBtn) {
            testChartsBtn.addEventListener('click', () => this.testCharts());
        }

        // Bouton mode expert
        const expertModeBtn = document.getElementById('expertModeBtn');
        if (expertModeBtn) {
            expertModeBtn.addEventListener('click', () => this.toggleExpertMode());
        }

        // Bouton fermer mode expert
        const closeExpertBtn = document.getElementById('closeExpertBtn');
        if (closeExpertBtn) {
            closeExpertBtn.addEventListener('click', () => this.closeExpertMode());
        }

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    // Lier les événements des sliders
    bindSliderEvents() {
        const sliders = [
            { id: 'tempSlider', param: 'temperature', suffix: '°C' },
            { id: 'humiditySlider', param: 'humidity', suffix: '%' },
            { id: 'pressureSlider', param: 'pressure', suffix: ' hPa' },
            { id: 'windSlider', param: 'windSpeed', suffix: ' km/h' },
            { id: 'windDirSlider', param: 'windDirection', suffix: '' },
            { id: 'dewPointSlider', param: 'dewPoint', suffix: '°C' },
            { id: 'cloudCoverSlider', param: 'cloudCover', suffix: '%' },
            { id: 'precipitationSlider', param: 'precipitation', suffix: ' mm/h' },
            { id: 'solarRadiationSlider', param: 'solarRadiation', suffix: ' W/m²' }
        ];

        sliders.forEach(slider => {
            const element = document.getElementById(slider.id);
            if (element) {
                element.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    weatherSimulation.updateParameter(slider.param, value);
                    
                    // Animation visuelle du slider
                    this.animateSlider(element);
                });
            }
        });
        
        // Gestion du sélecteur de type de nuage
        const cloudTypeSelect = document.getElementById('cloudTypeSelect');
        if (cloudTypeSelect) {
            cloudTypeSelect.addEventListener('change', (e) => {
                weatherSimulation.updateParameter('cloudType', e.target.value);
            });
        }
    }

    // Animer le slider lors du changement
    animateSlider(slider) {
        slider.style.transform = 'scale(1.05)';
        slider.style.transition = 'transform 0.1s ease';
        setTimeout(() => {
            slider.style.transform = 'scale(1)';
        }, 100);
    }

    // Initialiser la carte
    initializeMap() {
        const mapContainer = document.getElementById('labMap');
        if (!mapContainer) return;

        // Coordonnées par défaut (Fribourg)
        const lat = 46.8059;
        const lon = 7.1618;

        this.map = L.map('labMap').setView([lat, lon], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Marqueur principal
        this.mainMarker = L.marker([lat, lon]).addTo(this.map)
            .bindPopup('Zone de simulation météorologique - Fribourg')
            .openPopup();

        // Ajouter des overlays météo
        this.addWeatherOverlays();
    }

    // Ajouter des overlays météorologiques à la carte
    addWeatherOverlays() {
        // Overlay de température (simulation)
        this.temperatureLayer = L.layerGroup().addTo(this.map);
        
        // Overlay de vent
        this.windLayer = L.layerGroup().addTo(this.map);
        
        // Contrôle des couches
        const overlayMaps = {
            "Température": this.temperatureLayer,
            "Vent": this.windLayer
        };
        
        L.control.layers(null, overlayMaps).addTo(this.map);
    }

    // Initialiser les sliders avec des valeurs par défaut
    initializeSliders() {
        weatherSimulation.updateSliders();
        weatherSimulation.updateDisplay();
    }

    // Afficher l'animation de bienvenue
    showWelcomeAnimation() {
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            welcomeMessage.style.opacity = '0';
            welcomeMessage.style.transform = 'translateY(20px)';
            welcomeMessage.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                welcomeMessage.style.opacity = '1';
                welcomeMessage.style.transform = 'translateY(0)';
            }, 300);
        }
    }

    // Appliquer un preset
    applyPreset(presetName) {
        weatherSimulation.applyPreset(presetName);
        
        // Animation du bouton
        const btn = document.querySelector(`[data-preset="${presetName}"]`);
        if (btn) {
            btn.style.transform = 'scale(0.95)';
            btn.style.transition = 'transform 0.1s ease';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 100);
        }

        // Mise à jour de la carte si nécessaire
        this.updateMapVisualization();
        
        // Notification
        this.showNotification(`Preset "${weatherSimulation.presets[presetName].name}" appliqué`, 'success');
    }

    // Lancer une simulation
    runSimulation() {
        const btn = document.getElementById('simulateBtn');
        if (!btn) return;

        // Animation du bouton
        btn.disabled = true;
        btn.innerHTML = '⏳ Simulation en cours...';
        btn.classList.add('animate-pulse');

        // Effet de chargement
        setTimeout(() => {
            try {
                const simulation = weatherSimulation.runSimulation();
                
                // Mettre à jour la visualisation de la carte
                this.updateMapVisualization();
                
                // Animation des résultats
                this.animateResults();
                
                // Forcer la mise à jour des graphiques
                if (window.labCharts) {
                    window.labCharts.updateCharts(weatherSimulation.history);
                } else {
                    console.warn('labCharts non disponible pour la mise à jour');
                }
                
                // Notification de succès
                this.showNotification('Simulation terminée avec succès!', 'success');
                
            } catch (error) {
                console.error('Erreur lors de la simulation:', error);
                this.showNotification('Erreur lors de la simulation', 'error');
            } finally {
                // Restaurer le bouton
                btn.disabled = false;
                btn.innerHTML = '🚀 Lancer la Simulation';
                btn.classList.remove('animate-pulse');
            }
            
        }, 1500); // Délai simulé pour l'effet
    }

    // Animer l'affichage des résultats
    animateResults() {
        const resultsSection = document.getElementById('simulationResults');
        if (resultsSection && !resultsSection.classList.contains('hidden')) {
            resultsSection.style.transform = 'scale(0.95)';
            resultsSection.style.transition = 'transform 0.3s ease';
            
            setTimeout(() => {
                resultsSection.style.transform = 'scale(1)';
            }, 100);
        }
    }

    // Mettre à jour la visualisation de la carte
    updateMapVisualization() {
        if (!this.map) return;

        const params = weatherSimulation.currentParams;
        
        // Nettoyer les couches existantes
        this.temperatureLayer.clearLayers();
        this.windLayer.clearLayers();
        
        // Ajouter des cercles de température
        const tempColor = this.getTemperatureColor(params.temperature);
        const tempCircle = L.circle([46.8059, 7.1618], {
            color: tempColor,
            fillColor: tempColor,
            fillOpacity: 0.3,
            radius: 5000
        }).addTo(this.temperatureLayer);
        
        tempCircle.bindPopup(`Température: ${params.temperature}°C`);
        
        // Ajouter des flèches de vent
        this.addWindArrows();
        
        // Mettre à jour le marqueur principal
        if (this.mainMarker) {
            const popupContent = `
                <div class="text-center">
                    <strong>Zone de simulation</strong><br>
                    🌡️ ${params.temperature}°C<br>
                    💧 ${params.humidity}%<br>
                    📊 ${params.pressure} hPa<br>
                    💨 ${params.windSpeed} km/h
                </div>
            `;
            this.mainMarker.setPopupContent(popupContent);
        }
    }

    // Obtenir la couleur basée sur la température
    getTemperatureColor(temp) {
        if (temp < 0) return '#3B82F6'; // Bleu pour le froid
        if (temp < 10) return '#06B6D4'; // Cyan
        if (temp < 20) return '#10B981'; // Vert
        if (temp < 30) return '#F59E0B'; // Jaune
        return '#EF4444'; // Rouge pour la chaleur
    }

    // Ajouter des flèches de vent sur la carte
    addWindArrows() {
        const params = weatherSimulation.currentParams;
        const windSpeed = params.windSpeed;
        const windDir = params.windDirection;
        
        if (windSpeed === 0) return;
        
        // Créer plusieurs flèches pour simuler le vent (coordonnées autour de Fribourg)
        const positions = [
            [46.81, 7.16], [46.805, 7.165], [46.815, 7.155], 
            [46.80, 7.17], [46.82, 7.15]
        ];
        
        positions.forEach(pos => {
            const arrow = this.createWindArrow(pos, windDir, windSpeed);
            arrow.addTo(this.windLayer);
        });
    }

    // Créer une flèche de vent
    createWindArrow(position, direction, speed) {
        const arrowSize = Math.min(speed / 10, 5); // Taille basée sur la vitesse
        const color = speed > 40 ? '#EF4444' : speed > 20 ? '#F59E0B' : '#10B981';
        
        // Convertir la direction en radians
        const angle = (direction * Math.PI) / 180;
        
        // Créer un marker personnalisé avec une flèche SVG
        const arrowIcon = L.divIcon({
            html: `
                <div style="
                    width: ${20 + arrowSize * 2}px; 
                    height: ${20 + arrowSize * 2}px; 
                    transform: rotate(${direction}deg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <svg width="${15 + arrowSize}" height="${15 + arrowSize}" viewBox="0 0 24 24" fill="${color}">
                        <path d="M12 2L22 12L12 22L12 16L2 16L2 8L12 8Z"/>
                    </svg>
                </div>
            `,
            className: 'wind-arrow',
            iconSize: [20 + arrowSize * 2, 20 + arrowSize * 2],
            iconAnchor: [10 + arrowSize, 10 + arrowSize]
        });
        
        return L.marker(position, { icon: arrowIcon })
            .bindPopup(`Vent: ${speed} km/h vers ${weatherSimulation.getWindDirection(direction)}`);
    }

    // Effacer l'historique
    clearHistory() {
        if (confirm('Êtes-vous sûr de vouloir effacer tout l\'historique ?')) {
            weatherSimulation.clearHistory();
            this.showNotification('Historique effacé', 'info');
        }
    }

    // Tester les graphiques
    testCharts() {
        console.log('🧪 Test des graphiques...');
        
        // Vérifier Chart.js
        if (typeof Chart === 'undefined') {
            this.showNotification('Chart.js non chargé!', 'error');
            return;
        }
        
        // Vérifier les éléments canvas
        const tempCanvas = document.getElementById('tempCompareChart');
        const humidityCanvas = document.getElementById('humidityCompareChart');
        
        if (!tempCanvas) {
            this.showNotification('Canvas tempCompareChart non trouvé!', 'error');
            return;
        }
        
        if (!humidityCanvas) {
            this.showNotification('Canvas humidityCompareChart non trouvé!', 'error');
            return;
        }
        
        // Vérifier labCharts
        if (!window.labCharts) {
            this.showNotification('labCharts non initialisé! Tentative de réinitialisation...', 'warning');
            
            // Tenter de réinitialiser
            try {
                if (window.initializeCharts) {
                    window.initializeCharts();
                    this.showNotification('Graphiques réinitialisés!', 'success');
                } else {
                    this.showNotification('Impossible de réinitialiser les graphiques', 'error');
                }
            } catch (error) {
                this.showNotification('Erreur lors de la réinitialisation: ' + error.message, 'error');
            }
            return;
        }
        
        // Créer des données de test
        const testHistory = [];
        for (let i = 0; i < 5; i++) {
            testHistory.push({
                timestamp: new Date(Date.now() - i * 60000), // 1 minute d'intervalle
                params: {
                    temperature: 20 + Math.random() * 10,
                    humidity: 50 + Math.random() * 30,
                    pressure: 1000 + Math.random() * 40,
                    windSpeed: 5 + Math.random() * 20,
                    windDirection: Math.random() * 360
                }
            });
        }
        
        // Mettre à jour les graphiques avec les données de test
        try {
            window.labCharts.updateCharts(testHistory);
            this.showNotification('Test des graphiques réussi!', 'success');
            console.log('✅ Graphiques testés avec succès');
        } catch (error) {
            this.showNotification('Erreur lors du test: ' + error.message, 'error');
            console.error('❌ Erreur test graphiques:', error);
        }
    }

    // Gérer les raccourcis clavier
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    this.runSimulation();
                    break;
                case 'r':
                    e.preventDefault();
                    this.resetToDefaults();
                    break;
                case 'h':
                    e.preventDefault();
                    this.showHelp();
                    break;
            }
        }
        
        // Raccourcis pour les presets
        if (e.altKey) {
            switch (e.key) {
                case '1':
                    this.applyPreset('sunny');
                    break;
                case '2':
                    this.applyPreset('rainy');
                    break;
                case '3':
                    this.applyPreset('stormy');
                    break;
                case '4':
                    this.applyPreset('winter');
                    break;
                case '5':
                    this.applyPreset('heatwave');
                    break;
            }
        }
    }

    // Réinitialiser aux valeurs par défaut
    resetToDefaults() {
        weatherSimulation.currentParams = {
            temperature: 25,
            humidity: 60,
            pressure: 1013,
            windSpeed: 15,
            windDirection: 0,
            dewPoint: 17,
            cloudCover: 80,
            precipitation: 5,
            cloudType: 'Cumulus',
            solarRadiation: 500
        };
        weatherSimulation.updateSliders();
        weatherSimulation.updateDisplay();
        this.updateMapVisualization();
        this.showNotification('Paramètres réinitialisés', 'info');
    }

    // Afficher l'aide
    showHelp() {
        const helpText = `
            Raccourcis clavier:
            • Ctrl+S : Lancer une simulation
            • Ctrl+R : Réinitialiser les paramètres
            • Ctrl+H : Afficher cette aide
            • Alt+1-5 : Appliquer les presets
        `;
        alert(helpText);
    }

    // Afficher une notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all transform translate-x-full`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white',
            warning: 'bg-yellow-500 text-black'
        };
        
        notification.className += ` ${colors[type] || colors.info}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Suppression automatique
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Exporter la configuration actuelle
    exportConfiguration() {
        const config = {
            parameters: weatherSimulation.currentParams,
            history: weatherSimulation.history,
            timestamp: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `meteo-lab-config-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Configuration exportée', 'success');
    }

    // Importer une configuration
    importConfiguration(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                weatherSimulation.currentParams = config.parameters;
                weatherSimulation.history = config.history || [];
                weatherSimulation.updateSliders();
                weatherSimulation.updateDisplay();
                weatherSimulation.updateHistory();
                weatherSimulation.updateCharts();
                this.updateMapVisualization();
                this.showNotification('Configuration importée', 'success');
            } catch (error) {
                this.showNotification('Erreur lors de l\'import', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Basculer le mode expert
    toggleExpertMode() {
        const expertSection = document.getElementById('expertSection');
        const expertBtn = document.getElementById('expertModeBtn');
        
        if (expertSection.classList.contains('hidden')) {
            this.showExpertMode();
            expertBtn.textContent = '🔬 Mode Expert - Activé';
            expertBtn.classList.remove('from-emerald-500', 'to-teal-600');
            expertBtn.classList.add('from-orange-500', 'to-red-600');
        } else {
            this.closeExpertMode();
        }
    }

    // Afficher le mode expert
    showExpertMode() {
        const expertSection = document.getElementById('expertSection');
        expertSection.classList.remove('hidden');
        
        // Afficher les calculs détaillés actuels
        this.displayExpertCalculations();
        
        // Animation d'apparition
        expertSection.style.opacity = '0';
        expertSection.style.transform = 'translateY(20px)';
        expertSection.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            expertSection.style.opacity = '1';
            expertSection.style.transform = 'translateY(0)';
        }, 100);
    }

    // Fermer le mode expert
    closeExpertMode() {
        const expertSection = document.getElementById('expertSection');
        const expertBtn = document.getElementById('expertModeBtn');
        
        expertSection.classList.add('hidden');
        expertBtn.textContent = '🔬 Mode Expert - Calculs Détaillés';
        expertBtn.classList.remove('from-orange-500', 'to-red-600');
        expertBtn.classList.add('from-emerald-500', 'to-teal-600');
    }

    // Afficher les calculs détaillés
    displayExpertCalculations() {
        const params = weatherSimulation.currentParams;
        const calculationsDiv = document.getElementById('expertCalculations');
        
        // Calculs en temps réel
        const dewPointCalc = weatherSimulation.calculateDewPoint(params.temperature, params.humidity);
        const heatIndex = weatherSimulation.calculateHeatIndex(params.temperature, params.humidity);
        const windChill = weatherSimulation.calculateWindChill(params.temperature, params.windSpeed);
        const visibility = weatherSimulation.calculateVisibility(params.humidity, params.precipitation, params.cloudCover);
        const uvIndex = weatherSimulation.calculateUVIndex(params.solarRadiation, params.cloudCover);
        const seaLevelPressure = weatherSimulation.calculateSeaLevelPressure(params.pressure);
        
        let calculationsHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                    <h5 class="font-semibold text-emerald-200">🌡️ Calculs Thermiques</h5>
                    <div class="pl-4 space-y-1 text-xs">
                        <div><strong>Point de rosée calculé:</strong> ${dewPointCalc.toFixed(1)}°C</div>
                        <div><strong>Point de rosée actuel:</strong> ${params.dewPoint}°C</div>
                        <div><strong>Différence:</strong> ${Math.abs(dewPointCalc - params.dewPoint).toFixed(1)}°C</div>
                        <div class="text-emerald-300">Formule Magnus: Td = (b × α) / (a - α)</div>
                    </div>
                    
                    <div class="pl-4 space-y-1 text-xs">
                        <div><strong>Indice de chaleur:</strong> ${heatIndex.toFixed(1)}°C</div>
                        <div><strong>Refroidissement éolien:</strong> ${windChill.toFixed(1)}°C</div>
                        <div class="text-emerald-300">Température ressentie: ${params.temperature > 27 ? heatIndex.toFixed(1) : (params.temperature < 10 ? windChill.toFixed(1) : params.temperature)}°C</div>
                    </div>
                </div>
                
                <div class="space-y-2">
                    <h5 class="font-semibold text-emerald-200">📊 Autres Calculs</h5>
                    <div class="pl-4 space-y-1 text-xs">
                        <div><strong>Visibilité:</strong> ${visibility.toFixed(1)} km</div>
                        <div><strong>Indice UV:</strong> ${uvIndex.toFixed(1)}/11</div>
                        <div><strong>Pression niveau mer:</strong> ${seaLevelPressure.toFixed(1)} hPa</div>
                        <div class="text-emerald-300">Altitude supposée: 500m</div>
                    </div>
                </div>
            </div>
            
            <div class="mt-4 p-3 bg-emerald-900 bg-opacity-50 rounded">
                <h5 class="font-semibold text-emerald-200 mb-2">🔍 Validations Automatiques</h5>
                <div class="text-xs space-y-1">
                    ${dewPointCalc > params.temperature ? 
                        '<div class="text-red-300">⚠️ Point de rosée supérieur à la température - Correction automatique appliquée</div>' : 
                        '<div class="text-green-300">✅ Point de rosée cohérent</div>'
                    }
                    ${params.precipitation > 0 && params.cloudCover < 30 ? 
                        '<div class="text-yellow-300">⚠️ Précipitations sans nuages - Couverture nuageuse ajustée</div>' : 
                        '<div class="text-green-300">✅ Cohérence précipitations/nuages</div>'
                    }
                    ${params.solarRadiation > (1200 * (1 - params.cloudCover / 100)) ? 
                        '<div class="text-yellow-300">⚠️ Rayonnement solaire trop élevé - Ajustement automatique</div>' : 
                        '<div class="text-green-300">✅ Rayonnement solaire cohérent</div>'
                    }
                </div>
            </div>
        `;
        
        calculationsDiv.innerHTML = calculationsHTML;
    }
}

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    const meteoLab = new MeteoLab();
    
    // Rendre l'instance accessible globalement pour le débogage
    window.meteoLab = meteoLab;
    
    console.log('🧪 Laboratoire Météorologique initialisé');
    console.log('Raccourcis disponibles: Ctrl+S (simulation), Ctrl+R (reset), Ctrl+H (aide)');
});
