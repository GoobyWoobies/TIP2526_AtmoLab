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
        this.loadDefaultScenario();
        this.showWelcomeAnimation();
        
        // Initialiser le tutoriel après un délai pour s'assurer que tout est chargé
        setTimeout(() => {
        this.initializeTutorial();
        }, 1000);
    }

    loadDefaultScenario() {
        // Charger un scénario par défaut au lancement
        this.applyPreset('sunny');
        
        // Lancer une simulation automatique pour afficher les graphiques et calculs
        setTimeout(() => {
            this.runSimulation();
        }, 500);
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
        const tutorialBtn = document.getElementById('tutorialBtn');
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

        // Bouton Tutoriel (réafficher le guide)
        if (tutorialBtn) {
            tutorialBtn.addEventListener('click', () => {
                // Forcer l'ouverture du tutoriel, ignorer la préférence "ne plus afficher"
                this.openTutorial(true);
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
                    // Pas de mise à jour des résultats en temps réel
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

    // Désactivé: pas de mise à jour en temps réel des résultats
    // updateLivePreview() {}

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
        // Utiliser uniquement l'instantané de la dernière simulation
        const resultsSection = document.getElementById('simulationResults');
        const hasSnapshot = resultsSection && !resultsSection.classList.contains('hidden') && weatherSimulation.history && weatherSimulation.history.length > 0;
        const snapshotParams = hasSnapshot ? weatherSimulation.history[0].params : null;
        const calculationsDiv = document.getElementById('expertCalculations');
        if (!snapshotParams) {
            if (calculationsDiv) {
                calculationsDiv.innerHTML = '<div class="text-sm text-emerald-100">Lancez une simulation pour afficher les calculs détaillés.</div>';
            }
            return;
        }
        const params = snapshotParams;
        
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

            <div class="mt-4 p-3 bg-gray-800/60 rounded border border-gray-700 text-xs text-gray-200 space-y-1">
                <div class="font-semibold text-white">ℹ️ Aide — définitions rapides</div>
                <div>• <span class="font-medium">Température (T)</span> : température de l’air à 2 m du sol, en °C.</div>
                <div>• <span class="font-medium">Humidité relative (HR)</span> : saturation de l’air en % (100% = air saturé).</div>
                <div>• <span class="font-medium">Pression</span> : pression atmosphérique locale en hPa (hectopascals).</div>
                <div>• <span class="font-medium">Vent</span> : vitesse en km/h et direction cardinale; plus le vent est fort, plus la sensation de froid augmente.</div>
                <div>• <span class="font-medium">Point de rosée (Td)</span> : température où l’air devient saturé en vapeur d’eau. Td proche de T = air très humide.</div>
                <div>• <span class="font-medium">Couverture nuageuse</span> : part de ciel couvert en %, impacte ensoleillement et visibilité.</div>
                <div>• <span class="font-medium">Précipitations</span> : intensité estimée en mm/h (pluie ou neige fondue équivalente).</div>
                <div>• <span class="font-medium">Type de nuage</span> : catégorie dominante (ex. Cumulus, Stratocumulus, Nimbostratus…).</div>
                <div>• <span class="font-medium">Rayonnement solaire</span> : puissance solaire incidente en W/m² mesurée au sol.</div>
                <div>• <span class="font-medium">Irradiance effective</span> : rayonnement après atténuation par les nuages.</div>
                <div>• <span class="font-medium">Température de surface (estimée)</span> : approximation de la T° au sol influencée par le rayonnement.</div>
                <div>• <span class="font-medium">Température ressentie (radiation)</span> : effet de la radiation solaire sur la sensation thermique.</div>
                <div>• <span class="font-medium">Humidex</span> : indicateur canadien de <em>température ressentie</em> par temps chaud, combinant chaleur et humidité. >30 = inconfort, >40 = danger.</div>
                <div>• <span class="font-medium">Indice de chaleur (Heat Index)</span> : ressenti à l’ombre avec humidité élevée et vent faible; surtout pertinent pour T ≥ 27°C.</div>
                <div>• <span class="font-medium">Refroidissement éolien (Wind Chill)</span> : ressenti plus froid avec le vent (applicable pour T ≤ 10°C et vent ≥ 4.8 km/h).</div>
                <div>• <span class="font-medium">Indice UV</span> : intensité du rayonnement UV (0–11+). ≥6 : protection recommandée; ≥8 : exposition courte.</div>
                <div>• <span class="font-medium">Pression niveau mer</span> : pression corrigée de l’altitude pour comparer dans le temps et l’espace.</div>
                <div>• <span class="font-medium">Humidité absolue</span> : quantité de vapeur d’eau en g/m³ (masse par volume d’air).</div>
                <div>• <span class="font-medium">HR (condensation)</span> : humidité relative recalculée à partir de T et Td (proximité de saturation).</div>
                <div>• <span class="font-medium">Altitude estimée</span> : altitude approximée déduite de la pression mesurée.</div>
                <div>• <span class="font-medium">Force du vent</span> : force exercée par le vent sur 1 m² (Newtons), augmente avec V².</div>
                <div>• <span class="font-medium">Angles solaires</span> : Élévation (hauteur du soleil), Azimut (direction sur l’horizon), Zénith (90° − élévation).</div>
                <div>• <span class="font-medium">Risque de gel/givre</span> : signalé si T ≤ 0°C et Td ≤ 0°C.</div>
                <div>• <span class="font-medium">Risque de brume/brouillard</span> : élevé si T et Td sont proches (<2°C) avec HR > 85%.</div>
            </div>
        `;
        
        calculationsDiv.innerHTML = calculationsHTML;
    }

    // Variante permettant de passer une date spécifique (depuis l'UI expert)
    displayExpertCalculationsWithDate(date) {
        const resultsSection = document.getElementById('simulationResults');
        const hasSnapshot = resultsSection && !resultsSection.classList.contains('hidden') && weatherSimulation.history && weatherSimulation.history.length > 0;
        if (!hasSnapshot) {
            const calculationsDiv = document.getElementById('expertCalculations');
            if (calculationsDiv) {
                calculationsDiv.innerHTML = '<div class="text-sm text-emerald-100">Lancez une simulation pour afficher les calculs détaillés.</div>';
            }
            return;
        }
        const calculationsDiv = document.getElementById('expertCalculations');
        const sun = weatherSimulation.calculateSolarPosition(weatherSimulation.latitude, weatherSimulation.longitude, date);
        this.displayExpertCalculations();
        if (calculationsDiv) {
            calculationsDiv.innerHTML = calculationsDiv.innerHTML
                .replace(/Élévation soleil:<\/strong> .*?°/, `Élévation soleil:</strong> ${sun.elevation.toFixed(1)}°`)
                .replace(/Azimut:<\/strong> .*?°/, `Azimut:</strong> ${sun.azimuth.toFixed(1)}°`)
                .replace(/Zénith:<\/strong> .*?°/, `Zénith:</strong> ${sun.zenith.toFixed(1)}°`);
        }
    }

    // ======================= Tutoriel Moderne =======================
    initializeTutorial() {
        const dontShow = localStorage.getItem('lab_tutorial_hide') === '1';
        if (!dontShow) {
            // Ouvrir au premier chargement avec un délai plus long
            setTimeout(() => this.openTutorial(false), 1500);
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
                title: 'Bienvenue !',
                content: 'Découvrez le laboratoire météorologique interactif. Une simulation ensoleillée est déjà lancée pour vous montrer toutes les fonctionnalités. Ce guide vous expliquera chaque section étape par étape.',
                target: null,
                position: 'center'
            },
            {
                title: 'Paramètres Météorologiques',
                content: 'Ajustez la température, l\'humidité, la pression et le vent avec ces curseurs. Chaque paramètre influence les calculs météorologiques. Un scénario ensoleillé est déjà configuré.',
                target: '.glass-effect:first-of-type',
                position: 'right'
            },
            {
                title: 'Scénarios Prédéfinis',
                content: 'Utilisez ces préréglages pour simuler rapidement des conditions météo typiques : ensoleillé (déjà sélectionné), pluvieux, orageux, hivernal ou canicule.',
                target: '.glass-effect:nth-of-type(2)',
                position: 'right'
            },
            {
                title: 'Lancer la Simulation',
                content: 'Cliquez sur ce bouton pour exécuter les calculs météorologiques avec vos paramètres actuels. Le scénario ensoleillé est déjà configuré.',
                target: '#simulateBtn',
                position: 'bottom'
            },
            {
                title: 'Calculs Détaillés',
                content: 'Ici apparaissent les résultats détaillés de la simulation : température ressentie, indices de confort, et analyses météorologiques. Une simulation est déjà affichée.',
                target: '#simulationResults',
                position: 'left'
            },
            {
                title: 'Historique des Simulations',
                content: 'Toutes vos simulations sont sauvegardées ici. Vous pouvez consulter l\'historique complet de vos expérimentations météorologiques.',
                target: '#simulationHistory',
                position: 'right'
            },
            {
                title: 'Graphiques Comparatifs',
                content: 'Visualisez l\'évolution de vos simulations avec ces graphiques interactifs de température et d\'humidité. Les graphiques de la simulation actuelle sont affichés.',
                target: '.glass-effect:nth-of-type(4)',
                position: 'right'
            },
            {
                title: 'Mode Expert',
                content: 'Activez ce mode pour débloquer des paramètres avancés comme le point de rosée, les types de nuages, et les calculs solaires.',
                target: '#expertModeBtn',
                position: 'bottom'
            }
        ];
    }

    renderTutorial() {
        const overlay = document.getElementById('tutorialOverlay');
        const popup = document.getElementById('tutorialPopup');
        const arrow = document.getElementById('tutorialArrow');
        const title = document.getElementById('tutorialTitle');
        const content = document.getElementById('tutorialContent');
        const stepNumber = document.getElementById('tutorialStepNumber');
        const currentStep = document.getElementById('currentStep');
        const totalSteps = document.getElementById('totalSteps');
        const progressBar = document.getElementById('progressBar');
        const stepProgress = document.getElementById('stepProgress');
        const prevBtn = document.getElementById('tutorialPrev');
        const nextBtn = document.getElementById('tutorialNext');

        if (!overlay || !popup || !arrow) return;

        const step = this.tutorialSteps[this.tutorialStep];
        const progress = ((this.tutorialStep + 1) / this.tutorialSteps.length) * 100;

        // Mettre à jour le contenu
        title.textContent = step.title;
        content.textContent = step.content;
        stepNumber.textContent = this.tutorialStep + 1;
        currentStep.textContent = this.tutorialStep + 1;
        totalSteps.textContent = this.tutorialSteps.length;
        stepProgress.textContent = Math.round(progress) + '%';
        progressBar.style.width = progress + '%';

        // Gérer les boutons
        if (prevBtn) prevBtn.disabled = this.tutorialStep === 0;
        if (nextBtn) {
            nextBtn.textContent = this.tutorialStep === this.tutorialSteps.length - 1 ? 'Terminer' : 'Suivant';
        }

        // Positionner la popup et la flèche
        this.positionTutorialElements(step);
    }

    positionTutorialElements(step) {
        const overlay = document.getElementById('tutorialOverlay');
        const popup = document.getElementById('tutorialPopup');
        const arrow = document.getElementById('tutorialArrow');
        
        if (!overlay || !popup || !arrow) return;

        if (step.target && step.target !== 'null') {
            const targetElement = document.querySelector(step.target);
            if (targetElement) {
                
                // Faire défiler vers l'élément ciblé avec des décalages spéciaux
                if (step.target === '#simulateBtn') {
                    // Scroll spécial pour le bouton simulation
                    this.scrollToSimulateButton();
                } else if (step.target === '#simulationHistory') {
                    // Scroll spécial pour l'historique - centrer la section parent
                    const historySection = targetElement.closest('.glass-effect');
                    if (historySection) {
                        this.scrollToElement(historySection, -100);
                    } else {
                        this.scrollToElement(targetElement, -100);
                    }
                } else if (step.target === '.glass-effect:nth-of-type(4)') {
                    // Scroll spécial pour les graphiques - centrer la section
                    this.scrollToElement(targetElement, -100);
                } else {
                    this.scrollToElement(targetElement, 0);
                }
                
                // Attendre que le scroll soit terminé avant de positionner
                let delay = 300;
                if (step.target === '#simulateBtn') {
                    delay = 800; // Délai plus long pour le bouton simulation
                } else if (step.target === '#simulationHistory' || step.target === '.glass-effect:nth-of-type(4)') {
                    delay = 600; // Délai moyen pour les sections importantes
                }
                setTimeout(() => {
                    // Mettre en surbrillance l'élément ciblé
                    this.applyHighlightEffect(step.target);
                    
                    // Positionner la popup et la flèche
                    this.positionPopupAndArrow(targetElement, step.position, popup, arrow);
                }, delay);
            }
        } else {
            // Centrer la popup pour l'étape de bienvenue
            popup.style.left = '50%';
            popup.style.top = '50%';
            popup.style.transform = 'translate(-50%, -50%)';
            arrow.style.display = 'none';
            
            // Pas d'effet pour l'étape de bienvenue
            this.applyHighlightEffect(null);
        }
    }



    scrollToSimulateButton() {
        // Scroll direct vers le bouton simulation
        const simulateBtn = document.getElementById('simulateBtn');
        if (simulateBtn) {
            // Scroll pour centrer le bouton en haut de l'écran
            const elementRect = simulateBtn.getBoundingClientRect();
            const scrollTop = window.pageYOffset + elementRect.top - 200; // 200px du haut
            
            window.scrollTo({
                top: Math.max(0, scrollTop),
                left: 0,
                behavior: 'smooth'
            });
        }
    }

    scrollToElement(element, offset = 0) {
        const elementRect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Calculer la position de scroll optimale avec décalage
        let scrollTop = window.pageYOffset + elementRect.top - (viewportHeight / 2) + (elementRect.height / 2) + offset;
        let scrollLeft = window.pageXOffset + elementRect.left - (viewportWidth / 2) + (elementRect.width / 2);
        
        // S'assurer que l'élément reste visible
        const minScrollTop = window.pageYOffset + elementRect.top - 100; // 100px de marge en haut
        const maxScrollTop = window.pageYOffset + elementRect.bottom - viewportHeight + 100; // 100px de marge en bas
        
        scrollTop = Math.max(minScrollTop, Math.min(maxScrollTop, scrollTop));
        scrollLeft = Math.max(0, scrollLeft); // Ne pas scroller négativement
        
        // Faire le scroll en douceur
        window.scrollTo({
            top: scrollTop,
            left: scrollLeft,
            behavior: 'smooth'
        });
    }

    applyHighlightEffect(targetSelector) {
        // Retirer tous les effets précédents
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });

        if (!targetSelector || targetSelector === 'null') {
            return; // Pas d'effet pour l'étape de bienvenue
        }

        // Mettre en surbrillance l'élément ciblé
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
            // Pour l'historique, mettre en surbrillance la section parent
            if (targetElement.id === 'simulationHistory') {
                const historySection = targetElement.closest('.glass-effect');
                if (historySection) {
                    historySection.classList.add('tutorial-highlight');
                } else {
                    targetElement.classList.add('tutorial-highlight');
                }
            } 
            // Pour les graphiques, s'assurer que la section est mise en surbrillance
            else if (targetSelector && targetSelector.includes('glass-effect:nth-of-type(4)')) {
                targetElement.classList.add('tutorial-highlight');
            } 
            else {
                targetElement.classList.add('tutorial-highlight');
            }
        }
    }


    positionPopupAndArrow(targetElement, position, popup, arrow) {
        // Recalculer la position après le scroll
        const targetRect = targetElement.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let popupX, popupY, arrowX, arrowY, arrowClass;

        // Ajuster la position selon l'espace disponible
        const spaceTop = targetRect.top;
        const spaceBottom = viewportHeight - targetRect.bottom;
        const spaceLeft = targetRect.left;
        const spaceRight = viewportWidth - targetRect.right;

        // Gestion spéciale pour le bouton simulation
        if (targetElement.id === 'simulateBtn') {
            // Positionner la pop-up en bas à gauche du bouton
            position = 'bottom';
        } else if (targetElement.id === 'simulationHistory') {
            // Pour l'historique, positionner à droite avec flèche à gauche
            const historySection = targetElement.closest('.glass-effect');
            if (historySection) {
                const sectionRect = historySection.getBoundingClientRect();
                targetRect = sectionRect;
                position = 'right';
            }
        } else if (targetElement.classList.contains('glass-effect') && targetElement.querySelector('#tempCompareChart')) {
            // Pour les graphiques, positionner à droite
            position = 'right';
        } else {
            // Choisir la meilleure position si l'espace est insuffisant
            if (position === 'top' && spaceTop < popupRect.height + 40) {
                position = spaceBottom > spaceTop ? 'bottom' : 'right';
            } else if (position === 'bottom' && spaceBottom < popupRect.height + 40) {
                position = spaceTop > spaceBottom ? 'top' : 'right';
            } else if (position === 'left' && spaceLeft < popupRect.width + 40) {
                position = spaceRight > spaceLeft ? 'right' : 'top';
            } else if (position === 'right' && spaceRight < popupRect.width + 40) {
                position = spaceLeft > spaceRight ? 'left' : 'top';
            }
        }

        switch (position) {
            case 'top':
                popupX = targetRect.left + (targetRect.width / 2) - (popupRect.width / 2);
                popupY = targetRect.top - popupRect.height - 20;
                arrowX = targetRect.left + (targetRect.width / 2) - 8;
                arrowY = targetRect.top - 20;
                arrowClass = 'tutorial-arrow-bottom';
                break;
            case 'bottom':
                popupX = targetRect.left + (targetRect.width / 2) - (popupRect.width / 2);
                popupY = targetRect.bottom + 20;
                arrowX = targetRect.left + (targetRect.width / 2) - 8;
                arrowY = targetRect.bottom + 4;
                arrowClass = 'tutorial-arrow-top';
                break;
            case 'left':
                popupX = targetRect.left - popupRect.width - 20;
                popupY = targetRect.top + (targetRect.height / 2) - (popupRect.height / 2);
                arrowX = targetRect.left - 20;
                arrowY = targetRect.top + (targetRect.height / 2) - 8;
                arrowClass = 'tutorial-arrow-right';
                break;
            case 'right':
                popupX = targetRect.right + 20;
                popupY = targetRect.top + (targetRect.height / 2) - (popupRect.height / 2);
                arrowX = targetRect.right + 4;
                arrowY = targetRect.top + (targetRect.height / 2) - 8;
                arrowClass = 'tutorial-arrow-left';
                break;
        }

        // Ajuster si la popup sort de l'écran
        if (popupX < 20) popupX = 20;
        if (popupX + popupRect.width > viewportWidth - 20) {
            popupX = viewportWidth - popupRect.width - 20;
        }
        if (popupY < 20) popupY = 20;
        if (popupY + popupRect.height > viewportHeight - 20) {
            popupY = viewportHeight - popupRect.height - 20;
        }

        // Positionner la popup avec animation
        popup.style.left = popupX + 'px';
        popup.style.top = popupY + 'px';
        popup.style.transform = 'none';
        popup.style.opacity = '0';
        
        // Animation d'apparition
        setTimeout(() => {
            popup.style.opacity = '1';
        }, 50);

        // Positionner et orienter la flèche
        arrow.style.left = arrowX + 'px';
        arrow.style.top = arrowY + 'px';
        arrow.style.display = 'block';
        arrow.style.opacity = '0';
        arrow.className = `absolute w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-emerald-500 transition-all duration-500 ease-out ${arrowClass}`;
        
        // Animation de la flèche
        setTimeout(() => {
            arrow.style.opacity = '1';
        }, 100);
    }

    changeTutorialStep(delta) {
        const overlay = document.getElementById('tutorialOverlay');
        if (!overlay) return;
        
        this.tutorialStep = Math.max(0, Math.min(this.tutorialSteps.length - 1, this.tutorialStep + delta));
        
        if (this.tutorialStep === this.tutorialSteps.length - 1 && delta > 0) {
            // Dernière étape -> terminer le tutoriel
            this.closeTutorial();
            return;
        }
        
        this.renderTutorial();
    }

    openTutorial(force) {
        const overlay = document.getElementById('tutorialOverlay');
        if (!overlay) return;
        
        // Empêcher le scroll pendant le tutoriel
        document.body.style.overflow = 'hidden';
        
        // Commencer tout en haut du site
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        
        this.tutorialStep = 0;
        this.renderTutorial();
        overlay.classList.remove('hidden');
        
        if (force) {
            const dontShowCb = document.getElementById('tutorialDontShow');
            if (dontShowCb) dontShowCb.checked = false;
        }
    }

    closeTutorial() {
        const overlay = document.getElementById('tutorialOverlay');
        if (!overlay) return;
        
        // Retirer tous les effets
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
        
        // Nettoyer les exemples du tutoriel
        this.cleanupTutorialExamples();
        
        // Réactiver le scroll
        document.body.style.overflow = '';
        
        overlay.classList.add('hidden');
    }

    cleanupTutorialExamples() {
        // Supprimer tous les exemples du tutoriel
        document.querySelectorAll('.tutorial-example').forEach(example => {
            example.remove();
        });
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
