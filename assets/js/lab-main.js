// Application principale du laboratoire météorologique
class MeteoLab {
    constructor() {
        this.map = null;
        this.overrideDate = null; // date/heure globale pour les calculs solaire
        // Paramètre supprimé: les calculs détaillés n'affichent aucun contrôle; l'heure globale reste en en-tête
        this.initializeApp();
    }

    // Initialiser l'application
    initializeApp() {
        // Lier les événements immédiatement
        this.bindEvents();
        
        // Initialiser les sliders
        this.initializeSliders();
        
        // Charger un scénario par défaut et lancer une simulation immédiatement
        this.loadDefaultScenarioWithSimulation();
        
        // Animation de bienvenue (non bloquante)
        this.showWelcomeAnimation();
        
        // Initialiser le tutoriel rapidement après le chargement
        setTimeout(() => {
            this.initializeTutorial();
        }, 1500);
    }

    loadDefaultScenario() {
        // Charger un scénario par défaut au lancement sans lancer de simulation
        weatherSimulation.applyPreset('sunny');
    }

    // Charger un scénario par défaut et lancer une simulation immédiatement
    loadDefaultScenarioWithSimulation() {
        // Charger le scénario "Journée ensoleillée" par défaut
        weatherSimulation.applyPreset('sunny');
        
        // Lancer immédiatement une simulation silencieuse (sans popup de chargement)
        setTimeout(() => {
            this.runSimulationSilent();
        }, 100);
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
        console.log('Found preset buttons:', presetBtns.length);
        presetBtns.forEach(btn => {
            console.log('Binding preset button:', btn.getAttribute('data-preset'));
            btn.addEventListener('click', (e) => {
                // Utiliser closest() pour trouver le bouton parent avec data-preset
                const button = e.target.closest('.preset-btn');
                const preset = button ? button.getAttribute('data-preset') : null;
                console.log('Preset button clicked:', preset);
                if (preset) {
                    this.applyPreset(preset);
                } else {
                    console.error('No preset found for clicked element');
                }
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
                        // Paramètres simplifiés pour la météo actuelle
                        // Appliquer
                        weatherSimulation.currentParams = {
                            temperature: temp,
                            humidity: humidity,
                            pressure: pressure,
                            windSpeed: windSpeedKmh,
                            cloudCover: cloudCover,
                            precipitation: precipitation
                        };
                        weatherSimulation.updateSliders();
                        weatherSimulation.updateDisplay();
                        this.showNotification('Météo actuelle chargée', 'success');
                        
                        // Lancer automatiquement une simulation après avoir chargé la météo actuelle
                        setTimeout(() => {
                            this.runSimulation();
                        }, 500);
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
                console.log('Bouton tutoriel cliqué - ouverture forcée');
                this.openTutorial(true);
            });
        }


        // Bouton fermer supprimé de la feuille de calculs


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
            { id: 'cloudCoverSlider', param: 'cloudCover', suffix: '%' },
            { id: 'precipitationSlider', param: 'precipitation', suffix: ' mm/h' }
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
        console.log('applyPreset called with:', presetName);
        
        // Vérifier que le preset existe
        if (!weatherSimulation.presets[presetName]) {
            console.error('Preset not found:', presetName);
            return;
        }
        
        console.log('Applying preset:', weatherSimulation.presets[presetName]);
        
        // Appliquer le preset
        weatherSimulation.applyPreset(presetName);
        
        // Vérifier que les sliders ont été mis à jour
        console.log('Current params after preset:', weatherSimulation.currentParams);
        
        // Animation du bouton
        const btn = document.querySelector(`[data-preset="${presetName}"]`);
        if (btn) {
            btn.style.transform = 'scale(0.95)';
            btn.style.transition = 'transform 0.1s ease';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 100);
        } else {
            console.error('Button not found for preset:', presetName);
        }

        // Lancer automatiquement la simulation
        setTimeout(() => {
            console.log('Launching simulation...');
            this.runSimulation();
        }, 300);
        
        // Notification
        this.showNotification(`Preset "${weatherSimulation.presets[presetName].name}" appliqué`, 'success');
    }

    // Lancer une simulation
    runSimulation() {
        const btn = document.getElementById('simulateBtn');
        if (!btn) return;

        // Afficher le popup de chargement
        this.showLoadingPopup();

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
                
                // Notification de succès
                this.showNotification('Simulation terminée avec succès!', 'success');
                
            } catch (error) {
                console.error('Erreur lors de la simulation:', error);
                this.showNotification('Erreur lors de la simulation', 'error');
            } finally {
                // Masquer le popup de chargement
                this.hideLoadingPopup();
                
                // Restaurer le bouton
                btn.disabled = false;
                btn.innerHTML = '🚀 Lancer la Simulation';
                btn.classList.remove('animate-pulse');
            }
            
        }, 1500); // Délai simulé pour l'effet
    }

    // Lancer une simulation silencieuse (sans popup de chargement)
    runSimulationSilent() {
        try {
            const simulation = weatherSimulation.runSimulation();
            
            // Animation des résultats
            this.animateResults();
            
            // Notification de succès (optionnelle)
            // this.showNotification('Simulation terminée avec succès!', 'success');
            
        } catch (error) {
            console.error('Erreur lors de la simulation silencieuse:', error);
        }
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
            cloudCover: 80,
            precipitation: 5
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

    // Afficher le popup de chargement
    showLoadingPopup() {
        const popup = document.getElementById('loadingPopup');
        if (popup) {
            popup.classList.remove('hidden');
        }
    }

    // Masquer le popup de chargement
    hideLoadingPopup() {
        const popup = document.getElementById('loadingPopup');
        if (popup) {
            popup.classList.add('hidden');
        }
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


    // ======================= Tutoriel Moderne =======================
    initializeTutorial() {
        const dontShow = localStorage.getItem('lab_tutorial_hide') === '1';
        console.log('Initialisation du tutoriel, dontShow:', dontShow);
        
        if (!dontShow) {
            // Ouvrir immédiatement le tutoriel
            console.log('Ouverture du tutoriel...');
            this.openTutorial(false);
        } else {
            // Si l'utilisateur a choisi de ne plus afficher, on peut quand même initialiser
            // les éléments du tutoriel pour le cas où il voudrait le relancer manuellement
            console.log('Tutoriel masqué par préférence utilisateur');
            console.log('Pour réinitialiser le tutoriel, tapez: resetTutorial() dans la console');
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
                title: '🎉 Tutoriel terminé !',
                content: 'Félicitations ! Vous maîtrisez maintenant le laboratoire météorologique. Amusez-vous bien à explorer différents scénarios et découvrez comment les paramètres météorologiques influencent notre environnement. Bonne simulation !',
                target: null,
                position: 'center'
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

        // Vérifier que tutorialSteps est initialisé
        if (!this.tutorialSteps || this.tutorialSteps.length === 0) {
            console.error('Tutorial steps not initialized');
            return;
        }

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
            if (this.tutorialStep === this.tutorialSteps.length - 1) {
                nextBtn.textContent = 'Terminer';
                nextBtn.disabled = false;
            } else {
                nextBtn.textContent = 'Suivant';
                nextBtn.disabled = false;
            }
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
                } else if (step.target === '.glass-effect:nth-of-type(3)') {
                    // Scroll spécial pour les graphiques - centrer la section
                    this.scrollToElement(targetElement, -100);
                } else {
                    this.scrollToElement(targetElement, 0);
                }
                
                // Attendre que le scroll soit terminé avant de positionner
                let delay = 300;
                if (step.target === '#simulateBtn') {
                    delay = 800; // Délai plus long pour le bouton simulation
                } else if (step.target === '.glass-effect:nth-of-type(3)') {
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
            // Pour les graphiques, s'assurer que la section est mise en surbrillance
            if (targetSelector && targetSelector.includes('glass-effect:nth-of-type(3)')) {
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
        
        // Si on est sur la dernière étape et qu'on clique sur "Terminer"
        if (this.tutorialStep === this.tutorialSteps.length - 1 && delta > 0) {
            this.closeTutorial();
            return;
        }
        
        this.tutorialStep = Math.max(0, Math.min(this.tutorialSteps.length - 1, this.tutorialStep + delta));
        this.renderTutorial();
    }

    openTutorial(force) {
        console.log('openTutorial appelé avec force:', force);
        const overlay = document.getElementById('tutorialOverlay');
        if (!overlay) {
            console.error('Element tutorialOverlay non trouvé!');
            return;
        }
        
        console.log('Ouverture du tutoriel...');
        // Empêcher le scroll pendant le tutoriel
        document.body.style.overflow = 'hidden';
        
        // Commencer tout en haut du site
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        
        this.tutorialStep = 0;
        this.tutorialSteps = this.getTutorialSteps();
        this.renderTutorial();
        overlay.classList.remove('hidden');
        
        if (force) {
            const dontShowCb = document.getElementById('tutorialDontShow');
            if (dontShowCb) dontShowCb.checked = false;
        }
        
        console.log('Tutoriel ouvert avec succès');
        
        // Ajouter une méthode globale pour déboguer
        window.resetTutorial = () => {
            localStorage.removeItem('lab_tutorial_hide');
            console.log('Préférences du tutoriel réinitialisées');
            this.openTutorial(true);
        };
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
