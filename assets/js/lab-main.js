// Application principale du laboratoire météorologique
class MeteoLab {
    constructor() {
        this.map = null;
        this.isExpertMode = false;
        this.isDetailedCalcs = false;
        this.overrideDate = null; // date/heure globale pour les calculs solaire
        // Paramètre supprimé: les calculs détaillés n'affichent aucun contrôle; l'heure globale reste en en-tête
        this.initializeApp();
    }

    // Initialiser l'application
    initializeApp() {
        this.bindEvents();
        // Visualisation géographique supprimée
        this.initializeSliders();
        this.showWelcomeAnimation();
        this.initializeTutorial();
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

        // Bouton Météo actuelle (réelle)
        const currentWeatherBtn = document.getElementById('currentWeatherBtn');
        if (currentWeatherBtn) {
            currentWeatherBtn.addEventListener('click', async () => {
                try {
                    // Tenter d'utiliser la géolocalisation si disponible
                    const useCoords = await new Promise((resolve) => {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                                (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                                () => resolve(null),
                                { timeout: 4000 }
                            );
                        } else {
                            resolve(null);
                        }
                    });
                    const applyFromData = (data) => {
                        // Mapper OpenWeather vers nos paramètres
                        const temp = Math.round(data.main.temp);
                        const humidity = Math.round(data.main.humidity);
                        const pressure = Math.round(data.main.pressure);
                        const windSpeedKmh = Math.round((data.wind.speed || 0) * 3.6);
                        const cloudCover = data.clouds && typeof data.clouds.all === 'number' ? data.clouds.all : 0;
                        const precipitation = (data.rain && (data.rain['1h'] || data.rain['3h'])) ? Math.round((data.rain['1h'] || data.rain['3h']) * (data.rain['1h'] ? 1 : 0.33)) : 0;
                        const solarRadiation = 700; // approximation de base; pourrait être raffiné
                        const dewPointCalc = weatherSimulation.calculateDewPoint(temp, humidity);
                        // Appliquer
                        weatherSimulation.currentParams = {
                            temperature: temp,
                            humidity: humidity,
                            pressure: pressure,
                            windSpeed: windSpeedKmh,
                            windDirection: 0,
                            dewPoint: Math.round(dewPointCalc * 10) / 10,
                            cloudCover: cloudCover,
                            precipitation: precipitation,
                            cloudType: cloudCover > 80 ? 'Nimbostratus' : (cloudCover > 40 ? 'Stratocumulus' : 'Aucun'),
                            solarRadiation: solarRadiation
                        };
                        // Mettre à jour position si toggle activé
                        const positionEnableToggle = document.getElementById('positionEnableToggle');
                        if (useCoords && positionEnableToggle && positionEnableToggle.checked) {
                            weatherSimulation.latitude = useCoords.lat;
                            weatherSimulation.longitude = useCoords.lon;
                            const latInput = document.getElementById('sunLatInput');
                            const lonInput = document.getElementById('sunLonInput');
                            if (latInput) latInput.value = weatherSimulation.latitude.toFixed(4);
                            if (lonInput) lonInput.value = weatherSimulation.longitude.toFixed(4);
                        }
                        weatherSimulation.updateSliders();
                        weatherSimulation.updateDisplay();
                        this.showNotification('Météo actuelle chargée', 'success');
                    };

                    if (useCoords && typeof weatherAPI !== 'undefined' && weatherAPI.getWeatherByCoords) {
                        weatherAPI.getWeatherByCoords(useCoords.lat, useCoords.lon, applyFromData, (err) => {
                            this.showNotification('Erreur API: ' + err, 'error');
                        });
                    } else if (typeof weatherAPI !== 'undefined' && weatherAPI.getCurrentWeather) {
                        // Fallback: ville par défaut suisse (Fribourg)
                        weatherAPI.getCurrentWeather('Fribourg', applyFromData, (err) => {
                            this.showNotification('Erreur API: ' + err, 'error');
                        });
                    } else {
                        this.showNotification('API météo indisponible', 'error');
                    }
                } catch (e) {
                    console.error(e);
                    this.showNotification('Impossible de récupérer la météo actuelle', 'error');
                }
            });
        }

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

        // Bouton calculs détaillés
        const detailedModeBtn = document.getElementById('detailedModeBtn');
        if (detailedModeBtn) {
            detailedModeBtn.addEventListener('click', () => this.toggleDetailedMode());
        }

        // Bouton fermer supprimé de la feuille de calculs

        // Contrôles d'angles du soleil (expert)
        const sunLatInput = document.getElementById('sunLatInput');
        const sunLonInput = document.getElementById('sunLonInput');
        const sunAltInput = document.getElementById('sunAltInput');
        const sunDateInput = document.getElementById('sunDateInput');
        const sunApplyBtn = document.getElementById('sunApplyBtn');
        const sunGeoBtn = document.getElementById('sunGeoBtn');
        const positionEnableToggle = document.getElementById('positionEnableToggle');
        const globalTimeInput = document.getElementById('globalTimeInput');
        const globalTimeNowBtn = document.getElementById('globalTimeNowBtn');
        // aucun toggle d'utilisation des paramètres expert dans la feuille de calculs
        //
        
        if (sunLatInput && sunLonInput) {
            // Préremplir avec valeurs par défaut sans activer l'édition
            sunLatInput.value = weatherSimulation.latitude.toFixed(4);
            sunLonInput.value = weatherSimulation.longitude.toFixed(4);
        }
        if (sunAltInput) {
            sunAltInput.value = String(Math.round(weatherSimulation.altitude));
        }
        if (sunDateInput) {
            const nowLocal = new Date();
            sunDateInput.value = new Date(nowLocal.getTime() - nowLocal.getTimezoneOffset() * 60000)
                .toISOString().slice(0,16);
        }
        if (globalTimeInput) {
            const nowLocal = new Date();
            const hh = String(nowLocal.getHours()).padStart(2, '0');
            const mm = String(nowLocal.getMinutes()).padStart(2, '0');
            globalTimeInput.value = `${hh}:${mm}`;
            globalTimeInput.addEventListener('change', () => {
                const timeVal = globalTimeInput.value; // format HH:MM
                if (timeVal) {
                    const [h, m] = timeVal.split(':').map(v => parseInt(v, 10));
                    const d = new Date();
                    d.setHours(h, m, 0, 0);
                    this.overrideDate = d;
                } else {
                    this.overrideDate = null;
                }
                if (!document.getElementById('expertSection').classList.contains('hidden') || this.isDetailedCalcs) {
                    this.displayExpertCalculationsWithDate(this.overrideDate || new Date());
                }
            });
        }
        if (globalTimeNowBtn && globalTimeInput) {
            globalTimeNowBtn.addEventListener('click', () => {
                const nowLocal = new Date();
                const hh = String(nowLocal.getHours()).padStart(2, '0');
                const mm = String(nowLocal.getMinutes()).padStart(2, '0');
                globalTimeInput.value = `${hh}:${mm}`;
                const d = new Date();
                this.overrideDate = d;
                this.displayExpertCalculationsWithDate(this.overrideDate || new Date());
            });
        }
        if (sunApplyBtn) {
            sunApplyBtn.addEventListener('click', () => {
                const lat = parseFloat(sunLatInput.value);
                const lon = parseFloat(sunLonInput.value);
                const alt = parseFloat(sunAltInput.value);
                const dtVal = sunDateInput.value;
                if (!isNaN(lat)) weatherSimulation.latitude = lat;
                if (!isNaN(lon)) weatherSimulation.longitude = lon;
                if (!isNaN(alt)) weatherSimulation.altitude = alt;
                if (dtVal) this.overrideDate = new Date(dtVal);
                this.displayExpertCalculationsWithDate(this.overrideDate || new Date());
            });
        }
        if (positionEnableToggle && sunLatInput && sunLonInput && sunAltInput) {
            positionEnableToggle.addEventListener('change', (e) => {
                const enabled = !!e.target.checked;
                sunLatInput.disabled = !enabled;
                sunLonInput.disabled = !enabled;
                sunAltInput.disabled = !enabled;
                if (!enabled) {
                    // Revenir aux valeurs par défaut
                    weatherSimulation.latitude = 46.8059;
                    weatherSimulation.longitude = 7.1618;
                    weatherSimulation.altitude = 500;
                    sunLatInput.value = weatherSimulation.latitude.toFixed(4);
                    sunLonInput.value = weatherSimulation.longitude.toFixed(4);
                    sunAltInput.value = String(Math.round(weatherSimulation.altitude));
                } else {
                    // Appliquer les valeurs saisies actuelles
                    const lat = parseFloat(sunLatInput.value);
                    const lon = parseFloat(sunLonInput.value);
                    const alt = parseFloat(sunAltInput.value);
                    if (!isNaN(lat)) weatherSimulation.latitude = lat;
                    if (!isNaN(lon)) weatherSimulation.longitude = lon;
                    if (!isNaN(alt)) weatherSimulation.altitude = alt;
                }
                // Recalculer l'affichage si le panneau est visible
                if (!document.getElementById('expertSection').classList.contains('hidden') || this.isDetailedCalcs) {
                    this.displayExpertCalculationsWithDate(this.overrideDate || new Date());
                }
            });
            // Initial: inputs désactivés tant que le toggle n'est pas coché
            sunLatInput.disabled = true;
            sunLonInput.disabled = true;
            sunAltInput.disabled = true;
        }
        if (sunGeoBtn && navigator.geolocation) {
            sunGeoBtn.addEventListener('click', () => {
                navigator.geolocation.getCurrentPosition((pos) => {
                    weatherSimulation.latitude = pos.coords.latitude;
                    weatherSimulation.longitude = pos.coords.longitude;
                    if (!isNaN(pos.coords.altitude)) {
                        weatherSimulation.altitude = pos.coords.altitude;
                    }
                    if (sunLatInput && sunLonInput) {
                        sunLatInput.value = weatherSimulation.latitude.toFixed(4);
                        sunLonInput.value = weatherSimulation.longitude.toFixed(4);
                    }
                    if (sunAltInput && !isNaN(weatherSimulation.altitude)) {
                        sunAltInput.value = String(Math.round(weatherSimulation.altitude));
                    }
                    this.displayExpertCalculationsWithDate(this.overrideDate || new Date());
                }, () => {
                    this.showNotification('Impossible d\'obtenir la position', 'warning');
                });
            });
        }

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    // (supprimé) getSolarCalcDate: plus de toggle, on utilise overrideDate si présent sinon l'heure système

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
        // Visualisation géographique supprimée
        
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
                
                // Visualisation géographique supprimée
                
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

    // Obtenir la couleur basée sur la température
    getTemperatureColor(temp) {
        if (temp < 0) return '#3B82F6'; // Bleu pour le froid
        if (temp < 10) return '#06B6D4'; // Cyan
        if (temp < 20) return '#10B981'; // Vert
        if (temp < 30) return '#F59E0B'; // Jaune
        return '#EF4444'; // Rouge pour la chaleur
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
        // Visualisation géographique supprimée
        this.showNotification('Paramètres réinitialisés', 'info');
    }

    // Afficher l'aide
    showHelp() {
        this.openTutorial(true);
    }

    // Afficher une notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all transform translate-x-full`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white',
            warning: 'bg-yellow-500 text-white'
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
                // Visualisation géographique supprimée
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
        const expertOnly = document.querySelectorAll('.expert-only');
        
        this.isExpertMode = !this.isExpertMode;

        if (this.isExpertMode) {
            this.showExpertMode();
            expertBtn.textContent = '🔬 Mode Expert - Activé';
            expertBtn.classList.remove('from-emerald-500', 'to-teal-600');
            expertBtn.classList.add('from-orange-500', 'to-red-600');
            // Afficher les contrôles avancés
            expertOnly.forEach(el => el.classList.remove('hidden'));
        } else {
            this.closeExpertMode();
            // Masquer les contrôles avancés
            expertOnly.forEach(el => el.classList.add('hidden'));
        }
    }

    // Basculer les calculs détaillés (indépendant du mode expert)
    toggleDetailedMode() {
        const expertSection = document.getElementById('expertSection');
        const detailedBtn = document.getElementById('detailedModeBtn');
        
        this.isDetailedCalcs = !this.isDetailedCalcs;
        
        if (this.isDetailedCalcs) {
            // Afficher le panneau de calculs mais sans révéler les contrôles expert
            expertSection.classList.remove('hidden');
            this.displayExpertCalculations();
            detailedBtn.textContent = '🧮 Calculs détaillés - Activés';
            detailedBtn.classList.remove('from-indigo-500', 'to-purple-600');
            detailedBtn.classList.add('from-pink-500', 'to-red-600');
        } else {
            // Cacher le panneau si le mode expert n'est pas actif
            if (!this.isExpertMode) {
                expertSection.classList.add('hidden');
            }
            detailedBtn.textContent = '🧮 Calculs détaillés';
            detailedBtn.classList.remove('from-pink-500', 'to-red-600');
            detailedBtn.classList.add('from-indigo-500', 'to-purple-600');
        }
    }

    // Afficher le mode expert
    showExpertMode() {
        const expertSection = document.getElementById('expertSection');
        const expertOnly = document.querySelectorAll('.expert-only');
        expertSection.classList.remove('hidden');
        expertOnly.forEach(el => el.classList.remove('hidden'));
        
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
        const expertOnly = document.querySelectorAll('.expert-only');
        
        // Ne cacher le panneau de calculs que si le mode calculs détaillés est OFF
        if (!this.isDetailedCalcs) {
            expertSection.classList.add('hidden');
        }
        expertOnly.forEach(el => el.classList.add('hidden'));
        expertBtn.textContent = '🔬 Mode Expert';
        expertBtn.classList.remove('from-orange-500', 'to-red-600');
        expertBtn.classList.add('from-emerald-500', 'to-teal-600');
    }

    // Afficher les calculs détaillés
    displayExpertCalculations() {
        // Utiliser l'instantané de la dernière simulation si disponible et affichée,
        // sinon utiliser les paramètres courants (mais indiquer à l'utilisateur
        // qu'il doit lancer une simulation pour des valeurs consolidées)
        const resultsSection = document.getElementById('simulationResults');
        const hasSnapshot = resultsSection && !resultsSection.classList.contains('hidden') && weatherSimulation.history && weatherSimulation.history.length > 0;
        const snapshotParams = hasSnapshot ? weatherSimulation.history[0].params : null;
        const params = snapshotParams || weatherSimulation.currentParams;
        const calculationsDiv = document.getElementById('expertCalculations');
        
        // Calculs en temps réel
        const dewPointCalc = weatherSimulation.calculateDewPoint(params.temperature, params.humidity);
        const heatIndex = weatherSimulation.calculateHeatIndex(params.temperature, params.humidity);
        const windChill = weatherSimulation.calculateWindChill(params.temperature, params.windSpeed);
        const visibility = weatherSimulation.calculateVisibility(params.humidity, params.precipitation, params.cloudCover);
        const uvIndex = weatherSimulation.calculateUVIndex(params.solarRadiation, params.cloudCover);
        const seaLevelPressure = weatherSimulation.calculateSeaLevelPressure(params.pressure);
        const sun = weatherSimulation.calculateSolarPosition(weatherSimulation.latitude, weatherSimulation.longitude, this.overrideDate || new Date());
        const humidex = weatherSimulation.calculateHumidex(params.temperature, params.humidity);
        const absoluteHumidity = weatherSimulation.calculateAbsoluteHumidity(params.temperature, params.humidity);
        const surfaceTemp = weatherSimulation.calculateSurfaceTemperature(params.temperature, params.solarRadiation, params.cloudCover);
        const freezingRisk = weatherSimulation.hasFreezingRisk(params.temperature, params.dewPoint);
        const condensationRH = weatherSimulation.calculateCondensationRelativeHumidity(params.temperature, params.dewPoint);
        const altitudeApprox = weatherSimulation.calculateAltitudeFromPressure(params.pressure);
        const windForce = weatherSimulation.calculateWindForce(params.windSpeed);
        const effectiveIrradiance = weatherSimulation.calculateEffectiveIrradiance(params.solarRadiation, params.cloudCover);
        const radiativeFeelsLike = weatherSimulation.calculateRadiativeFeelsLike(params.temperature, params.solarRadiation, params.cloudCover);
        const fogRisk = weatherSimulation.hasFogRisk(params.temperature, params.dewPoint, params.humidity);
        
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
                        <div><strong>Humidex:</strong> ${humidex.toFixed(1)}</div>
                        <div><strong>T° surface (est.):</strong> ${surfaceTemp.toFixed(1)}°C</div>
                        <div><strong>T° ressentie (radiation):</strong> ${radiativeFeelsLike.toFixed(1)}°C</div>
                        <div>${freezingRisk ? '<span class="text-red-300">⚠️ Risque de gel/givre</span>' : '<span class="text-green-300">✅ Pas de gel</span>'}</div>
                        <div class="text-emerald-300">Température ressentie: ${params.temperature > 27 ? heatIndex.toFixed(1) : (params.temperature < 10 ? windChill.toFixed(1) : params.temperature)}°C</div>
                    </div>
                </div>
                
                <div class="space-y-2">
                    <h5 class="font-semibold text-emerald-200">📊 Autres Calculs</h5>
                    <div class="pl-4 space-y-1 text-xs">
                        <div><strong>Visibilité:</strong> ${visibility.toFixed(1)} km</div>
                        <div><strong>Indice UV:</strong> ${uvIndex.toFixed(1)}/11</div>
                        <div><strong>Pression niveau mer:</strong> ${seaLevelPressure.toFixed(1)} hPa</div>
                        <div><strong>Élévation soleil:</strong> ${sun.elevation.toFixed(1)}°</div>
                        <div><strong>Azimut:</strong> ${sun.azimuth.toFixed(1)}°</div>
                        <div><strong>Zénith:</strong> ${sun.zenith.toFixed(1)}°</div>
                        <div><strong>Humidité absolue:</strong> ${absoluteHumidity.toFixed(2)} g/m³</div>
                        <div><strong>RH (condensation):</strong> ${condensationRH.toFixed(0)}%</div>
                        <div><strong>Altitude estimée:</strong> ${altitudeApprox.toFixed(0)} m</div>
                        <div><strong>Force du vent (1 m²):</strong> ${windForce.toFixed(1)} N</div>
                        <div><strong>Irradiance effective:</strong> ${effectiveIrradiance.toFixed(0)} W/m²</div>
                        <div>${fogRisk ? '<span class="text-yellow-300">⚠️ Risque de brume/brouillard</span>' : '<span class="text-green-300">✅ Visibilité normale</span>'}</div>
                        <div class="text-emerald-300">Altitude supposée: 500m</div>
                    </div>
                </div>
            </div>
            
            <div class="mt-4 p-3 bg-emerald-900 bg-opacity-50 rounded">
                <h5 class="font-semibold text-emerald-200 mb-2">🔍 Validations Automatiques</h5>
                <div class="text-xs space-y-1">
                    ${!snapshotParams ? '<div class="text-yellow-300">ℹ️ Lancez une simulation pour figer et analyser ces valeurs</div>' : ''}
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

    // Variante permettant de passer une date spécifique (depuis l'UI expert)
    displayExpertCalculationsWithDate(date) {
        const params = weatherSimulation.currentParams;
        const calculationsDiv = document.getElementById('expertCalculations');
        const sun = weatherSimulation.calculateSolarPosition(weatherSimulation.latitude, weatherSimulation.longitude, date);
        // Reutiliser l'affichage standard mais en surchargeant uniquement les angles du soleil
        this.displayExpertCalculations();
        // Injecter les valeurs mises à jour
        if (calculationsDiv) {
            calculationsDiv.innerHTML = calculationsDiv.innerHTML
                .replace(/Élévation soleil:<\/strong> .*?°/,
                    `Élévation soleil:</strong> ${sun.elevation.toFixed(1)}°`)
                .replace(/Azimut:<\/strong> .*?°/,
                    `Azimut:</strong> ${sun.azimuth.toFixed(1)}°`)
                .replace(/Zénith:<\/strong> .*?°/,
                    `Zénith:</strong> ${sun.zenith.toFixed(1)}°`);
        }
    }

    // ======================= Tutoriel =======================
    initializeTutorial() {
        const dontShow = localStorage.getItem('lab_tutorial_hide') === '1';
        if (!dontShow) {
            // Ouvrir au premier chargement
            setTimeout(() => this.openTutorial(false), 400);
        }

        // Binder les boutons
        const prevBtn = document.getElementById('tutorialPrev');
        const nextBtn = document.getElementById('tutorialNext');
        const closeBtn = document.getElementById('tutorialClose');
        const dontShowCb = document.getElementById('tutorialDontShow');

        this.tutorialStep = 0;
        this.tutorialSteps = this.getTutorialSteps();
        this.renderTutorial();

        if (prevBtn) prevBtn.addEventListener('click', () => this.changeTutorialStep(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.changeTutorialStep(1));
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeTutorial());
        if (dontShowCb) dontShowCb.addEventListener('change', (e) => {
            localStorage.setItem('lab_tutorial_hide', e.target.checked ? '1' : '0');
        });
    }

    getTutorialSteps() {
        return [
            {
                title: 'Bienvenue dans le Laboratoire Météo',
                body: 'Ajustez les curseurs des paramètres (température, humidité, pression, vent…) dans le panneau de gauche. Les valeurs s\'affichent en direct.'
            },
            {
                title: 'Lancer une simulation',
                body: 'Cliquez sur “Lancer la Simulation”. Le panneau de résultats à droite s\'active et affiche l\'état synthétique (emoji, condition), ainsi que les détails (humidité, pression...).'
            },
            {
                title: 'Graphiques et Historique',
                body: 'Les 10 dernières simulations alimentent les graphiques de comparaison et l\'historique. Utilisez “Effacer l\'historique” pour repartir de zéro.'
            },
            {
                title: 'Modes Expert et Calculs détaillés',
                body: '“Mode Expert” dévoile des réglages avancés (point de rosée, type de nuage, rayonnement…) et les contrôles des angles du soleil. “Calculs détaillés” affiche les calculs (point de rosée, UV, angles du soleil…) même sans activer le mode Expert, mais sans possibilité de modifier les angles.'
            },
            {
                title: 'Angles du soleil',
                body: 'Pour Élévation/Azimut/Zénith: ouvrez “Mode Expert” puis ajustez Latitude, Longitude et Date/Heure (champ “Date/Heure”). Par défaut, l\'heure locale courante est utilisée. En mode non-expert, les angles sont affichés en lecture seule. “📍 Utiliser ma position” active la géolocalisation.'
            },
            {
                title: 'Raccourcis utiles',
                body: 'Ctrl+S: simulation • Ctrl+R: réinitialiser • Ctrl+H: ce tutoriel • Alt+1..5: presets rapides.'
            }
        ];
    }

    renderTutorial() {
        const overlay = document.getElementById('tutorialOverlay');
        const content = document.getElementById('tutorialContent');
        const prevBtn = document.getElementById('tutorialPrev');
        const nextBtn = document.getElementById('tutorialNext');
        if (!overlay || !content) return;

        const step = this.tutorialSteps[this.tutorialStep];
        content.innerHTML = `
            <div class="text-white font-semibold">${step.title}</div>
            <div class="text-gray-300">${step.body}</div>
        `;
        if (prevBtn) prevBtn.disabled = this.tutorialStep === 0;
        if (nextBtn) nextBtn.textContent = this.tutorialStep === this.tutorialSteps.length - 1 ? 'Terminer' : 'Suivant →';
    }

    changeTutorialStep(delta) {
        const overlay = document.getElementById('tutorialOverlay');
        if (!overlay) return;
        this.tutorialStep = Math.max(0, Math.min(this.tutorialSteps.length - 1, this.tutorialStep + delta));
        if (this.tutorialStep === this.tutorialSteps.length - 1 && delta > 0) {
            // Dernière étape -> terminaisons sur clic next
            this.closeTutorial();
            return;
        }
        this.renderTutorial();
    }

    openTutorial(force) {
        const overlay = document.getElementById('tutorialOverlay');
        if (!overlay) return;
        this.tutorialStep = 0;
        this.renderTutorial();
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
        if (force) {
            const dontShowCb = document.getElementById('tutorialDontShow');
            if (dontShowCb) dontShowCb.checked = false;
        }
    }

    closeTutorial() {
        const overlay = document.getElementById('tutorialOverlay');
        if (!overlay) return;
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
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
