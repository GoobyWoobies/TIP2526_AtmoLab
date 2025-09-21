// Classe pour gérer la simulation météorologique
class WeatherSimulation {
    constructor() {
        // Position par défaut (Fribourg, CH)
        this.latitude = 46.8059;
        this.longitude = 7.1618;
        this.altitude = 500; // m
        this.currentParams = {
            temperature: 25,
            humidity: 60,
            pressure: 1013,
            windSpeed: 15,
            cloudCover: 80,
            precipitation: 5
        };
        
        this.history = [];
        this.presets = {
            sunny: {
                temperature: 28,
                humidity: 45,
                pressure: 1020,
                windSpeed: 8,
                cloudCover: 10,
                precipitation: 0,
                name: "Journée ensoleillée"
            },
            rainy: {
                temperature: 15,
                humidity: 85,
                pressure: 995,
                windSpeed: 25,
                cloudCover: 100,
                precipitation: 12,
                name: "Temps pluvieux"
            },
            stormy: {
                temperature: 22,
                humidity: 90,
                pressure: 980,
                windSpeed: 65,
                cloudCover: 100,
                precipitation: 25,
                name: "Orage"
            },
            winter: {
                temperature: -5,
                humidity: 70,
                pressure: 1025,
                windSpeed: 15,
                cloudCover: 60,
                precipitation: 2,
                name: "Temps hivernal"
            },
            heatwave: {
                temperature: 42,
                humidity: 25,
                pressure: 1008,
                windSpeed: 5,
                cloudCover: 5,
                precipitation: 0,
                name: "Canicule"
            }
        };
    }

    // ========== CALCULS MÉTÉOROLOGIQUES PRÉCIS ==========
    
    // Calculer le point de rosée basé sur température et humidité (Formule Magnus)
    calculateDewPoint(temperature, humidity) {
        const a = 17.27;
        const b = 237.7;
        const alpha = ((a * temperature) / (b + temperature)) + Math.log(humidity / 100);
        return (b * alpha) / (a - alpha);
    }
    
    // Calculer l'humidité relative basée sur température et point de rosée
    calculateHumidity(temperature, dewPoint) {
        const a = 17.27;
        const b = 237.7;
        const es_t = Math.exp((a * temperature) / (b + temperature));
        const es_td = Math.exp((a * dewPoint) / (b + dewPoint));
        return Math.min(100, Math.max(0, (es_td / es_t) * 100));
    }
    
    // Calculer l'indice de chaleur (Heat Index)
    calculateHeatIndex(temperature, humidity) {
        const T = temperature;
        const RH = humidity;
        
        if (T < 27) return T; // Pas de correction nécessaire
        
        const c1 = -8.78469475556;
        const c2 = 1.61139411;
        const c3 = 2.33854883889;
        const c4 = -0.14611605;
        const c5 = -0.012308094;
        const c6 = -0.0164248277778;
        const c7 = 0.002211732;
        const c8 = 0.00072546;
        const c9 = -0.000003582;
        
        return c1 + (c2 * T) + (c3 * RH) + (c4 * T * RH) + (c5 * T * T) + 
               (c6 * RH * RH) + (c7 * T * T * RH) + (c8 * T * RH * RH) + 
               (c9 * T * T * RH * RH);
    }
    
    // Calculer la vitesse du vent ressentie (Wind Chill)
    calculateWindChill(temperature, windSpeed) {
        if (temperature > 10 || windSpeed < 4.8) return temperature;
        
        const T = temperature;
        const V = windSpeed;
        return 13.12 + 0.6215 * T - 11.37 * Math.pow(V, 0.16) + 0.3965 * T * Math.pow(V, 0.16);
    }
    
    // Calculer la pression réduite au niveau de la mer
    calculateSeaLevelPressure(pressure, altitude = 500) {
        // Formule barométrique
        return pressure * Math.pow((1 + (0.0065 * altitude) / 288.15), 5.255);
    }
    
    // Calculer la visibilité basée sur humidité et précipitations
    calculateVisibility(humidity, precipitation, cloudCover) {
        let visibility = 50; // km par défaut
        
        // Réduction due à l'humidité (brouillard)
        if (humidity > 95) visibility = Math.min(visibility, 1);
        else if (humidity > 90) visibility = Math.min(visibility, 5);
        else if (humidity > 80) visibility = Math.min(visibility, 15);
        
        // Réduction due aux précipitations
        if (precipitation > 20) visibility = Math.min(visibility, 2);
        else if (precipitation > 10) visibility = Math.min(visibility, 5);
        else if (precipitation > 2) visibility = Math.min(visibility, 10);
        
        // Réduction due aux nuages bas
        if (cloudCover > 80) visibility = Math.min(visibility, visibility * 0.8);
        
        return Math.max(0.1, visibility);
    }
    
    // Calculer l'indice UV basé sur rayonnement solaire
    calculateUVIndex(solarRadiation, cloudCover) {
        // Utiliser l'irradiance effective déjà pondérée par la nébulosité
        const effective = this.calculateEffectiveIrradiance(solarRadiation, cloudCover); // W/m²
        
        // Mise à l'échelle plus réaliste: ~1000 W/m² ciel clair ≈ UV 10
        // Ainsi chaque % de nuages impacte immédiatement l'UV
        let uvIndex = effective / 100; 
        
        return Math.max(0, Math.min(11, uvIndex));
    }

    // ================= CALCULS AVANCÉS =================
    
    // Humidex (indice chaleur + humidité)
    calculateHumidex(temperature, humidity) {
        // Calculer le point de rosée via Magnus puis la pression de vapeur e (hPa)
        const dewPoint = this.calculateDewPoint(temperature, humidity);
        const e = 6.112 * Math.exp((17.67 * dewPoint) / (dewPoint + 243.5));
        const humidex = temperature + 0.5555 * (e - 10);
        return humidex;
    }
    
    // Humidité absolue (g/m³)
    calculateAbsoluteHumidity(temperature, humidity) {
        // AH = 6.112 * e^(17.67*T/(T+243.5)) * (RH/100) * 2.1674 / (273.15 + T)
        const es = 6.112 * Math.exp((17.67 * temperature) / (temperature + 243.5));
        const AH = es * (humidity / 100) * 2.1674 / (273.15 + temperature);
        return AH * 1000 / 1000; // garder précision simple
    }
    
    // Altitude approximative depuis la pression (P0 par défaut = 1013.25 hPa)
    calculateAltitudeFromPressure(pressure, seaLevelPressure = 1013.25) {
        const ratio = pressure / seaLevelPressure;
        const h = 44330 * (1 - Math.pow(ratio, 1 / 5.255));
        return h;
    }
    
    // Température de surface (approximation simple via rayonnement et nuages)
    calculateSurfaceTemperature(airTemperature, solarRadiation, cloudCover) {
        const solarFactor = (solarRadiation / 1000) * (1 - cloudCover / 100);
        const delta = solarFactor * 5; // jusqu'à ~5°C d'impact à 1000 W/m² ciel clair
        return airTemperature + delta;
    }
    
    // Risque de gel/givre
    hasFreezingRisk(temperature, dewPoint) {
        return temperature <= 0 && dewPoint <= 0;
    }
    
    // Indice de condensation/saturation (recalcule HR à partir de T et Td)
    calculateCondensationRelativeHumidity(temperature, dewPoint) {
        return this.calculateHumidity(temperature, dewPoint);
    }
    
    // Type de précipitation probable
    getPrecipitationType(temperature) {
        return temperature < 0 ? 'neige' : 'pluie';
    }
    
    // Vérifier la cohérence précipitations/nuages
    checkPrecipitationConsistency(precipitation, cloudCover) {
        return precipitation > 0 && cloudCover < 30;
    }
    
    // Force du vent sur un objet: F = 0.5 * rho * Cd * A * V^2 (V en m/s)
    calculateWindForce(windSpeedKmH, rho = 1.225, dragCoefficient = 1.0, areaM2 = 1.0) {
        const v = windSpeedKmH / 3.6;
        const F = 0.5 * rho * dragCoefficient * areaM2 * v * v; // Newtons
        return F;
    }
    
    // Éclairement solaire effectif après nuages
    calculateEffectiveIrradiance(solarRadiation, cloudCover) {
        return solarRadiation * (1 - cloudCover / 100);
    }
    
    // Température ressentie via radiation (approximation)
    calculateRadiativeFeelsLike(temperature, solarRadiation, cloudCover) {
        const sEff = this.calculateEffectiveIrradiance(solarRadiation, cloudCover);
        const delta = (sEff / 1000) * 3; // jusqu'à ~3°C à 1000 W/m²
        return temperature + delta;
    }
    
    // Probabilité de brume/brouillard
    hasFogRisk(temperature, dewPoint, humidity) {
        return Math.abs(temperature - dewPoint) < 2 && humidity > 85;
    }

    // =============== Position du soleil (NOAA approx.) ===============
    // Retourne { elevation, azimuth, zenith }
    calculateSolarPosition(latitude, longitude, date = new Date()) {
        // Convertir en radians/degrés
        const rad = (deg) => (deg * Math.PI) / 180;
        const deg = (radVal) => (radVal * 180) / Math.PI;

        // Temps
        const d = date;
        const time = d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600;

        // Jour julien approximatif
        const year = d.getUTCFullYear();
        const month = d.getUTCMonth() + 1;
        const day = d.getUTCDate();
        const A = Math.floor((14 - month) / 12);
        const Y = year + 4800 - A;
        const M = month + 12 * A - 3;
        const JDN = day + Math.floor((153 * M + 2) / 5) + 365 * Y + Math.floor(Y / 4) - Math.floor(Y / 100) + Math.floor(Y / 400) - 32045;
        const JD = JDN + (time - 12) / 24;
        const n = JD - 2451545.0; // jours depuis J2000

        // Position moyenne du soleil
        const L = (280.46 + 0.9856474 * n) % 360; // longitude moyenne (deg)
        const g = rad((357.528 + 0.9856003 * n) % 360); // anomalie moyenne (rad)
        const lambda = rad((L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) % 360); // longitude écliptique (rad)

        // Obliquité de l'écliptique
        const epsilon = rad(23.439 - 0.0000004 * n);

        // Coord. équatoriales
        const alpha = Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda));
        const delta = Math.asin(Math.sin(epsilon) * Math.sin(lambda)); // déclinaison

        // Temps sidéral
        const GMST = (18.697374558 + 24.06570982441908 * n) % 24;
        const LMST = (GMST + longitude / 15) * 15; // en degrés
        const H = rad(((LMST - deg(alpha)) + 540) % 360 - 180); // angle horaire [-180,180]

        // Convertir en altitude/azimut
        const lat = rad(latitude);
        const elevation = Math.asin(
            Math.sin(lat) * Math.sin(delta) + Math.cos(lat) * Math.cos(delta) * Math.cos(H)
        );
        const azimuth = Math.atan2(
            -Math.sin(H),
            Math.tan(delta) * Math.cos(lat) - Math.sin(lat) * Math.cos(H)
        );

        const elevationDeg = deg(elevation);
        let azimuthDeg = (deg(azimuth) + 360) % 360; // 0=N, 90=E
        const zenithDeg = 90 - elevationDeg;

        return {
            elevation: elevationDeg,
            azimuth: azimuthDeg,
            zenith: zenithDeg
        };
    }
    
    // Valider et corriger la cohérence des paramètres
    validateAndCorrectParameters() {
        const isExpert = window.meteoLab && window.meteoLab.isExpertMode;
        if (!isExpert) {
            // En mode non-expert, ne pas modifier automatiquement les paramètres cachés
            return;
        }
        // Corriger le point de rosée s'il est incohérent
        const calculatedDewPoint = this.calculateDewPoint(this.currentParams.temperature, this.currentParams.humidity);
        if (Math.abs(this.currentParams.dewPoint - calculatedDewPoint) > 5) {
            this.currentParams.dewPoint = Math.round(calculatedDewPoint * 10) / 10;
        }
        
        // Ajuster les précipitations selon la couverture nuageuse
        if (this.currentParams.precipitation > 0 && this.currentParams.cloudCover < 30) {
            this.currentParams.cloudCover = Math.max(60, this.currentParams.cloudCover);
        }
        
        // Ne pas modifier durablement le rayonnement solaire lors des changements de nuages.
        // L'effet des nuages est appliqué dans les calculs (irradiance effective, UV),
        // pas en changeant la valeur saisie de solarRadiation.
        
        // Ajuster le type de nuage selon les conditions
        if (this.currentParams.precipitation > 15) {
            if (this.currentParams.temperature > 25) {
                this.currentParams.cloudType = 'Cumulonimbus';
            } else {
                this.currentParams.cloudType = 'Nimbostratus';
            }
        } else if (this.currentParams.cloudCover < 20) {
            this.currentParams.cloudType = 'Aucun';
        }
        
        // S'assurer que le point de rosée est inférieur à la température
        if (this.currentParams.dewPoint > this.currentParams.temperature) {
            this.currentParams.dewPoint = this.currentParams.temperature - 1;
        }
    }

    // Mettre à jour les paramètres
    updateParameter(param, value) {
        if (param === 'cloudType') {
            this.currentParams[param] = value;
        } else {
            this.currentParams[param] = parseFloat(value);
        }
        
        // Validation et correction automatique des paramètres
        this.validateAndCorrectParameters();
        // Mettre à jour uniquement les libellés et sliders, sans toucher aux résultats
        this.updateDisplay();
        this.updateSliders();
        // Ne pas recalculer l'analyse ni les résultats avant la simulation
    }

    // Appliquer un preset
    applyPreset(presetName) {
        console.log('WeatherSimulation.applyPreset called with:', presetName);
        const preset = this.presets[presetName];
        if (preset) {
            console.log('Preset found:', preset);
            this.currentParams = { ...preset };
            console.log('Current params updated:', this.currentParams);
            this.updateSliders();
            this.updateDisplay();
            console.log('Sliders and display updated');
            // Pas de mise à jour des résultats avant simulation
        } else {
            console.error('Preset not found in weatherSimulation:', presetName);
        }
    }

    // Mettre à jour l'affichage des valeurs
    updateDisplay() {
        document.getElementById('tempValue').textContent = `${this.currentParams.temperature}°C`;
        document.getElementById('humidityValue').textContent = `${this.currentParams.humidity}%`;
        document.getElementById('pressureValue').textContent = `${this.currentParams.pressure} hPa`;
        document.getElementById('windValue').textContent = `${this.currentParams.windSpeed} km/h`;
        
        const cloudCoverElement = document.getElementById('cloudCoverValue');
        if (cloudCoverElement) cloudCoverElement.textContent = `${this.currentParams.cloudCover}%`;
        
        const precipitationElement = document.getElementById('precipitationValue');
        if (precipitationElement) precipitationElement.textContent = `${this.currentParams.precipitation} mm/h`;
    }

    // Mettre à jour les sliders
    updateSliders() {
        console.log('updateSliders called with params:', this.currentParams);
        
        const tempSlider = document.getElementById('tempSlider');
        if (tempSlider) {
            tempSlider.value = this.currentParams.temperature;
            console.log('Temp slider updated to:', tempSlider.value);
        }
        
        const humiditySlider = document.getElementById('humiditySlider');
        if (humiditySlider) {
            humiditySlider.value = this.currentParams.humidity;
            console.log('Humidity slider updated to:', humiditySlider.value);
        }
        
        const pressureSlider = document.getElementById('pressureSlider');
        if (pressureSlider) {
            pressureSlider.value = this.currentParams.pressure;
            console.log('Pressure slider updated to:', pressureSlider.value);
        }
        
        const windSlider = document.getElementById('windSlider');
        if (windSlider) {
            windSlider.value = this.currentParams.windSpeed;
            console.log('Wind slider updated to:', windSlider.value);
        }
        
        const cloudCoverSlider = document.getElementById('cloudCoverSlider');
        if (cloudCoverSlider) {
            cloudCoverSlider.value = this.currentParams.cloudCover;
            console.log('Cloud cover slider updated to:', cloudCoverSlider.value);
        }
        
        const precipitationSlider = document.getElementById('precipitationSlider');
        if (precipitationSlider) {
            precipitationSlider.value = this.currentParams.precipitation;
            console.log('Precipitation slider updated to:', precipitationSlider.value);
        }
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
        this.updateCharts();

        return simulation;
    }

    // Calculer les effets météorologiques
    calculateWeatherEffects() {
        const { temperature, humidity, pressure, windSpeed, cloudCover, precipitation } = this.currentParams;
        
        // Calculs météorologiques précis
        const heatIndex = this.calculateHeatIndex(temperature, humidity);
        const windChill = this.calculateWindChill(temperature, windSpeed);
        const visibility = this.calculateVisibility(humidity, precipitation, cloudCover);
        const uvIndex = this.calculateUVIndex(500, cloudCover); // Valeur par défaut pour le rayonnement solaire
        const seaLevelPressure = this.calculateSeaLevelPressure(pressure);
        
        // Température ressentie (combinaison chaleur et froid)
        const feelsLike = temperature > 27 ? heatIndex : (temperature < 10 ? windChill : temperature);
        
        // Déterminer le type de temps
        let weatherType = this.determineWeatherType(temperature, humidity, pressure, windSpeed, precipitation, cloudCover);
        
        // Calculer l'indice de confort amélioré
        let comfortIndex = this.calculateAdvancedComfortIndex(temperature, humidity, windSpeed, feelsLike, uvIndex);
        
        // Calculer les risques avec plus de précision
        let risks = this.calculateAdvancedRisks(temperature, humidity, pressure, windSpeed, precipitation, 500, visibility, uvIndex);
        
        // Recommandations basées sur tous les paramètres
        let recommendations = this.generateAdvancedRecommendations(weatherType, comfortIndex, risks, feelsLike, uvIndex, visibility);
        
        // Prévisions d'évolution améliorées
        let evolution = this.predictAdvancedEvolution(temperature, humidity, pressure, windSpeed, cloudCover, precipitation, weatherType);

        return {
            weatherType,
            comfortIndex,
            risks,
            recommendations,
            evolution,
            emoji: this.getWeatherEmoji(weatherType),
            description: this.getWeatherDescription(weatherType),
            // Nouveaux calculs précis
            feelsLike: Math.round(feelsLike * 10) / 10,
            heatIndex: Math.round(heatIndex * 10) / 10,
            windChill: Math.round(windChill * 10) / 10,
            visibility: Math.round(visibility * 10) / 10,
            uvIndex: Math.round(uvIndex * 10) / 10,
            seaLevelPressure: Math.round(seaLevelPressure * 10) / 10
        };
    }

    // Déterminer le type de temps
    determineWeatherType(temp, humidity, pressure, wind, precipitation = 0, cloudCover = 0) {
        // Priorité aux précipitations
        if (precipitation > 20) return 'heavy_rain';
        if (precipitation > 5) return 'rain';
        if (precipitation > 0 && temp < 2) return 'snow';
        
        if (pressure < 985) {
            if (wind > 50) return 'storm';
            if (humidity > 80) return 'heavy_rain';
            return 'rain';
        }
        
        if (temp < 0) {
            if (humidity > 75 || precipitation > 0) return 'snow';
            return 'frost';
        }
        
        if (temp > 35) {
            if (humidity < 30) return 'hot_dry';
            return 'hot_humid';
        }
        
        // Utiliser la couverture nuageuse pour déterminer les conditions
        if (cloudCover > 80) return 'cloudy';
        if (cloudCover > 40) return 'partly_cloudy';
        if (pressure > 1020 && cloudCover < 20) return 'sunny';
        
        return 'partly_cloudy';
    }

    // Calculer l'indice de confort avancé
    calculateAdvancedComfortIndex(temp, humidity, wind, feelsLike, uvIndex) {
        let score = 50; // Score de base
        
        // Impact de la température ressentie
        if (feelsLike >= 18 && feelsLike <= 24) {
            score += 30; // Zone de confort optimal
        } else if (feelsLike >= 15 && feelsLike <= 27) {
            score += 20; // Zone confortable
        } else if (feelsLike >= 10 && feelsLike <= 30) {
            score += 10; // Zone acceptable
        } else if (feelsLike < 0 || feelsLike > 40) {
            score -= 40; // Conditions extrêmes
        } else {
            score -= 20; // Conditions difficiles
        }
        
        // Impact de l'humidité
        if (humidity >= 40 && humidity <= 60) {
            score += 15; // Humidité idéale
        } else if (humidity >= 30 && humidity <= 70) {
            score += 5; // Humidité acceptable
        } else if (humidity < 20 || humidity > 90) {
            score -= 20; // Humidité problématique
        } else {
            score -= 10; // Humidité inconfortable
        }
        
        // Impact du vent
        if (wind >= 5 && wind <= 15) {
            score += 10; // Vent agréable
        } else if (wind > 40) {
            score -= 25; // Vent très fort
        } else if (wind > 25) {
            score -= 15; // Vent fort
        }
        
        // Impact de l'UV
        if (uvIndex > 8) {
            score -= 15; // UV dangereux
        } else if (uvIndex > 5) {
            score -= 5; // UV élevé
        }
        
        score = Math.max(0, Math.min(100, score));
        
        // Déterminer le niveau
        let level;
        if (score >= 80) level = 'excellent';
        else if (score >= 70) level = 'très confortable';
        else if (score >= 60) level = 'confortable';
        else if (score >= 40) level = 'acceptable';
        else if (score >= 20) level = 'inconfortable';
        else level = 'très inconfortable';
        
        return { level, score: Math.round(score) };
    }

    // Calculer les risques météorologiques avancés
    calculateAdvancedRisks(temp, humidity, pressure, wind, precipitation, solarRadiation, visibility, uvIndex) {
        let risks = [];
        
        // Risques liés au vent (avec échelle de Beaufort)
        if (wind >= 118) risks.push({ type: 'Ouragan', level: 'extrême', description: 'Danger mortel - Restez à l\'abri' });
        else if (wind >= 88) risks.push({ type: 'Tempête violente', level: 'extrême', description: 'Dégâts considérables possibles' });
        else if (wind >= 62) risks.push({ type: 'Tempête', level: 'élevé', description: 'Chutes d\'arbres et dégâts structurels' });
        else if (wind >= 50) risks.push({ type: 'Vent très fort', level: 'élevé', description: 'Déplacements dangereux, objets emportés' });
        else if (wind >= 39) risks.push({ type: 'Vent fort', level: 'modéré', description: 'Difficultés de déplacement' });
        
        // Risques thermiques avec indice de chaleur
        const heatIndex = this.calculateHeatIndex(temp, humidity);
        if (heatIndex >= 54) risks.push({ type: 'Chaleur extrême', level: 'extrême', description: 'Coup de chaleur imminent' });
        else if (heatIndex >= 41) risks.push({ type: 'Danger de chaleur', level: 'élevé', description: 'Coup de chaleur et crampes probables' });
        else if (heatIndex >= 32) risks.push({ type: 'Prudence chaleur', level: 'modéré', description: 'Fatigue possible avec activité prolongée' });
        
        // Risques liés au froid avec facteur vent
        const windChill = this.calculateWindChill(temp, wind);
        if (windChill <= -40) risks.push({ type: 'Froid extrême', level: 'extrême', description: 'Gelures en moins de 10 minutes' });
        else if (windChill <= -28) risks.push({ type: 'Froid dangereux', level: 'élevé', description: 'Gelures en 30 minutes' });
        else if (windChill <= -10) risks.push({ type: 'Froid', level: 'modéré', description: 'Inconfort et risque d\'hypothermie' });
        
        // Risques liés à la pression
        if (pressure < 960) risks.push({ type: 'Dépression majeure', level: 'élevé', description: 'Tempête très probable' });
        else if (pressure < 980) risks.push({ type: 'Basse pression', level: 'modéré', description: 'Conditions météo instables' });
        else if (pressure > 1040) risks.push({ type: 'Haute pression', level: 'faible', description: 'Air stagnant possible' });
        
        // Risques liés aux précipitations
        if (precipitation >= 50) risks.push({ type: 'Précipitations torrentielles', level: 'extrême', description: 'Inondations éclair possibles' });
        else if (precipitation >= 25) risks.push({ type: 'Fortes précipitations', level: 'élevé', description: 'Inondations et coulées de boue' });
        else if (precipitation >= 10) risks.push({ type: 'Pluies importantes', level: 'modéré', description: 'Routes glissantes, aquaplaning' });
        
        // Risques UV
        if (uvIndex >= 11) risks.push({ type: 'UV extrême', level: 'extrême', description: 'Brûlures en moins de 10 minutes' });
        else if (uvIndex >= 8) risks.push({ type: 'UV très élevé', level: 'élevé', description: 'Protection maximale requise' });
        else if (uvIndex >= 6) risks.push({ type: 'UV élevé', level: 'modéré', description: 'Protection solaire recommandée' });
        
        // Risques de visibilité
        if (visibility < 1) risks.push({ type: 'Brouillard dense', level: 'élevé', description: 'Circulation très dangereuse' });
        else if (visibility < 5) risks.push({ type: 'Visibilité réduite', level: 'modéré', description: 'Conduite prudente nécessaire' });
        
        // Risques combinés
        if (temp < 2 && precipitation > 0) risks.push({ type: 'Verglas', level: 'élevé', description: 'Surfaces extrêmement glissantes' });
        if (humidity > 95 && temp > 0) risks.push({ type: 'Brouillard épais', level: 'modéré', description: 'Visibilité très limitée' });
        
        return risks;
    }

    // Générer des recommandations avancées
    generateAdvancedRecommendations(weatherType, comfort, risks, feelsLike, uvIndex, visibility) {
        let recommendations = [];
        
        // Recommandations basées sur le type de temps
        switch (weatherType) {
            case 'sunny':
                recommendations.push('🌞 Idéal pour les activités extérieures');
                if (uvIndex > 6) recommendations.push('☀️ Protection solaire obligatoire (crème, chapeau, lunettes)');
                break;
            case 'rain':
                recommendations.push('☔ Emportez un parapluie et des vêtements imperméables');
                recommendations.push('🚗 Réduisez votre vitesse en voiture');
                break;
            case 'heavy_rain':
                recommendations.push('🌧️ Évitez les déplacements non essentiels');
                recommendations.push('⚠️ Attention aux zones inondables et aux cours d\'eau');
                break;
            case 'storm':
                recommendations.push('🏠 Restez à l\'intérieur et fermez les volets');
                recommendations.push('⚡ Débranchez les appareils électriques');
                recommendations.push('🌳 Éloignez-vous des arbres et structures hautes');
                break;
            case 'snow':
                recommendations.push('❄️ Équipez votre véhicule (pneus hiver, chaînes)');
                recommendations.push('🧥 Portez plusieurs couches de vêtements');
                break;
            case 'hot_dry':
                recommendations.push('💧 Hydratation fréquente obligatoire');
                recommendations.push('🏃‍♂️ Évitez les efforts physiques entre 11h et 16h');
                break;
        }
        
        // Recommandations basées sur la température ressentie
        if (feelsLike < 0) {
            recommendations.push('🥶 Protégez les extrémités (gants, bonnet, écharpe)');
            recommendations.push('⏰ Limitez le temps d\'exposition au froid');
        } else if (feelsLike > 35) {
            recommendations.push('🌡️ Recherchez l\'ombre et la climatisation');
            recommendations.push('👕 Portez des vêtements légers et clairs');
        }
        
        // Recommandations basées sur la visibilité
        if (visibility < 5) {
            recommendations.push('🚗 Allumez vos feux de brouillard');
            recommendations.push('👁️ Augmentez les distances de sécurité');
        }
        
        // Recommandations basées sur le confort
        if (comfort.level === 'très inconfortable' || comfort.level === 'inconfortable') {
            recommendations.push('⚠️ Conditions difficiles - Adaptez vos activités');
        }
        
        // Recommandations basées sur les risques élevés
        const highRisks = risks.filter(risk => risk.level === 'élevé' || risk.level === 'extrême');
        if (highRisks.length > 0) {
            recommendations.push('🚨 Consultez les alertes météo officielles');
            recommendations.push('📱 Tenez-vous informé de l\'évolution');
        }
        
        return recommendations;
    }

    // Prédire l'évolution avancée
    predictAdvancedEvolution(temp, humidity, pressure, wind, cloudCover, precipitation, weatherType) {
        let trends = [];
        
        // Analyse de la tendance barométrique
        if (pressure < 980) {
            trends.push('📉 Pression très basse : système dépressionnaire actif, dégradation probable');
            trends.push('⛈️ Risque d\'orages ou de tempête dans les prochaines heures');
        } else if (pressure < 1000) {
            trends.push('📉 Pression basse : temps instable, possibles averses');
        } else if (pressure > 1030) {
            trends.push('📈 Haute pression : temps stable et sec attendu');
            trends.push('☀️ Conditions anticycloniques favorables');
        } else if (pressure > 1020) {
            trends.push('📈 Pression élevée : amélioration probable du temps');
        }
        
        // Analyse des interactions nuages-précipitations
        if (cloudCover > 80 && precipitation === 0) {
            trends.push('☁️ Couverture nuageuse dense : précipitations probables');
            if (temp < 2) trends.push('❄️ Risque de neige avec ces températures');
        }
        
        if (precipitation > 0 && cloudCover < 40) {
            trends.push('🌤️ Éclaircies possibles : fin des précipitations attendue');
        }
        
        // Analyse de l'instabilité atmosphérique
        if (temp > 25 && humidity > 70 && pressure < 1010) {
            trends.push('⚡ Conditions favorables aux orages cet après-midi');
        }
        
        // Évolution du vent
        if (wind > 40) {
            trends.push('💨 Vent fort : conditions ventées persistantes');
            if (pressure < 990) trends.push('🌪️ Renforcement possible du vent');
        } else if (wind < 5 && pressure > 1025) {
            trends.push('😶‍🌫️ Vent faible et haute pression : risque de brouillard matinal');
        }
        
        // Prévisions saisonnières simplifiées
        if (temp < 0 && humidity > 80) {
            trends.push('🧊 Formation de givre et verglas probable');
        }
        
        if (temp > 30 && humidity < 40) {
            trends.push('🔥 Conditions sèches : risque d\'incendie élevé');
        }
        
        // Évolution basée sur le type de temps actuel
        switch (weatherType) {
            case 'storm':
                trends.push('⛈️ Après l\'orage : amélioration graduelle attendue');
                break;
            case 'heavy_rain':
                trends.push('🌧️ Précipitations intenses : surveillance des cours d\'eau');
                break;
            case 'sunny':
                if (humidity > 60) trends.push('🌤️ Développement nuageux possible en soirée');
                break;
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
        
        document.getElementById('simCloudCover').textContent = `${simulation.params.cloudCover}%`;
        document.getElementById('simPrecipitation').textContent = `${simulation.params.precipitation} mm/h`;
        
        // Afficher l'analyse
        this.displayAnalysis(results);
    }

    // Afficher l'analyse détaillée
    displayAnalysis(results) {
        const params = this.currentParams;
        
        let analysisHTML = `
            <div class="space-y-4">
                <!-- Explication du résultat principal -->
                <div class="rounded-lg p-4 border border-gray-600" style="background-color: rgb(51, 51, 51);">
                    <h5 class="font-semibold text-white mb-3 flex items-center">
                        <span class="text-emerald-400 mr-2">🔍</span>
                        Pourquoi ce résultat ?
                    </h5>
                    <div class="text-gray-100 text-sm leading-relaxed">
                        ${this.generateDetailedExplanation(params, results)}
            </div>
            </div>

                <!-- Indicateurs clés -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="rounded-lg p-4 border border-gray-600" style="background-color: rgb(51, 51, 51);">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-white font-medium">🌡️ Température ressentie</span>
                            <span class="text-emerald-400 font-bold">${results.feelsLike}°C</span>
                        </div>
                        <div class="text-xs text-gray-200">
                            ${this.explainFeelsLike(params.temperature, params.humidity, params.windSpeed, results.feelsLike)}
                        </div>
                    </div>
                    
                    <div class="rounded-lg p-4 border border-gray-600" style="background-color: rgb(51, 51, 51);">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-white font-medium">📊 Confort thermique</span>
                            <span class="text-emerald-400 font-bold">${results.comfortIndex.score}/100</span>
                        </div>
                        <div class="text-xs text-gray-200">
                            ${this.explainComfortIndex(results.comfortIndex)}
                        </div>
                    </div>
                    
                    <div class="rounded-lg p-4 border border-gray-600" style="background-color: rgb(51, 51, 51);">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-white font-medium">👁️ Visibilité</span>
                            <span class="text-emerald-400 font-bold">${results.visibility} km</span>
                        </div>
                        <div class="text-xs text-gray-200">
                            ${this.explainVisibility(params.humidity, params.precipitation, params.cloudCover, results.visibility)}
                        </div>
                    </div>
                    
                    <div class="rounded-lg p-4 border border-gray-600" style="background-color: rgb(51, 51, 51);">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-white font-medium">☀️ Indice UV</span>
                            <span class="text-emerald-400 font-bold">${results.uvIndex}/11</span>
                        </div>
                        <div class="text-xs text-gray-200">
                            ${this.explainUVIndex(params.cloudCover, results.uvIndex)}
                        </div>
                    </div>
                </div>

                <!-- Liens contextuels -->
                <div class="rounded-lg p-4 border border-gray-600" style="background-color: rgb(51, 51, 51);">
                    <h5 class="font-semibold text-white mb-3 flex items-center">
                        <span class="text-emerald-400 mr-2">📚</span>
                        En savoir plus
                    </h5>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        ${this.generateContextualLinks(params)}
                    </div>
                </div>
        `;
        
        // Ajouter les risques si présents
        if (results.risks.length > 0) {
            analysisHTML += `
                <div class="rounded-lg p-4 border border-gray-600" style="background-color: rgb(51, 51, 51);">
                    <h5 class="font-semibold text-white mb-3 flex items-center">
                        <span class="text-emerald-400 mr-2">⚠️</span>
                        Risques identifiés
                    </h5>
                    <div class="space-y-2">
            `;
            results.risks.forEach(risk => {
                analysisHTML += `
                    <div class="text-sm text-gray-100">
                        <span class="font-medium text-white">${risk.type}</span>: ${risk.description}
                    </div>
                `;
            });
            analysisHTML += '</div></div>';
        }
        
        // Ajouter les recommandations
        if (results.recommendations.length > 0) {
            analysisHTML += `
                <div class="rounded-lg p-4 border border-gray-600" style="background-color: rgb(51, 51, 51);">
                    <h5 class="font-semibold text-white mb-3 flex items-center">
                        <span class="text-emerald-400 mr-2">💡</span>
                        Recommandations
                    </h5>
                    <div class="space-y-2">
            `;
            results.recommendations.forEach(rec => {
                analysisHTML += `<div class="text-sm text-gray-100">• ${rec}</div>`;
            });
            analysisHTML += '</div></div>';
        }
        
        // Ajouter les tendances
        if (results.evolution.length > 0) {
            analysisHTML += `
                <div class="rounded-lg p-4 border border-gray-600" style="background-color: rgb(51, 51, 51);">
                    <h5 class="font-semibold text-white mb-3 flex items-center">
                        <span class="text-emerald-400 mr-2">📈</span>
                        Évolution prévue
                    </h5>
                    <div class="space-y-2">
            `;
            results.evolution.forEach(trend => {
                analysisHTML += `<div class="text-sm text-gray-100">• ${trend}</div>`;
            });
            analysisHTML += '</div></div>';
        }
        
        analysisHTML += '</div>';
        document.getElementById('weatherAnalysis').innerHTML = analysisHTML;
    }

    // Générer une explication détaillée du résultat
    generateDetailedExplanation(params, results) {
        let explanation = `<div class="space-y-3">`;
        
        // Analyse de la température
        if (params.temperature > 30) {
            explanation += `<div class="p-3 rounded-lg border border-gray-500" style="background-color: rgba(51, 51, 51, 0.3);">
                <div class="flex items-center mb-2">
                    <span class="text-lg mr-2">🌡️</span>
                    <span class="text-white font-semibold">Température élevée (${params.temperature}°C)</span>
                </div>
                <p class="text-gray-200 text-sm">Cette chaleur crée une base thermique importante. `;
            if (params.humidity > 60) {
                explanation += `Combinée à l'humidité élevée (${params.humidity}%), elle empêche l'évaporation de la sueur, augmentant la sensation de chaleur.`;
            } else {
                explanation += `Avec une humidité modérée (${params.humidity}%), l'évaporation reste possible, limitant l'inconfort.`;
            }
            explanation += `</p></div>`;
        } else if (params.temperature < 5) {
            explanation += `<div class="p-3 rounded-lg border border-gray-500" style="background-color: rgba(51, 51, 51, 0.3);">
                <div class="flex items-center mb-2">
                    <span class="text-lg mr-2">❄️</span>
                    <span class="text-white font-semibold">Température froide (${params.temperature}°C)</span>
                </div>
                <p class="text-gray-200 text-sm">Cette fraîcheur crée une base thermique basse. `;
            if (params.windSpeed > 20) {
                explanation += `Le vent (${params.windSpeed} km/h) accélère la perte de chaleur corporelle, créant une sensation de froid intense.`;
            } else {
                explanation += `Sans vent fort, la sensation de froid reste modérée.`;
            }
            explanation += `</p></div>`;
        } else {
            explanation += `<div class="p-3 rounded-lg border border-gray-500" style="background-color: rgba(51, 51, 51, 0.3);">
                <div class="flex items-center mb-2">
                    <span class="text-lg mr-2">🌤️</span>
                    <span class="text-white font-semibold">Température modérée (${params.temperature}°C)</span>
                </div>
                <p class="text-gray-200 text-sm">Cette température offre une base thermique confortable.</p>
            </div>`;
        }
        
        // Analyse de la pression atmosphérique
        if (params.pressure < 1000) {
            explanation += `<div class="p-3 rounded-lg border border-gray-500" style="background-color: rgba(51, 51, 51, 0.3);">
                <div class="flex items-center mb-2">
                    <span class="text-lg mr-2">📉</span>
                    <span class="text-white font-semibold">Basse pression (${params.pressure} hPa)</span>
                </div>
                <p class="text-gray-200 text-sm">Cette pression indique un système dépressionnaire actif. Les basses pressions favorisent l'ascension de l'air, créant des conditions instables propices aux précipitations et aux vents forts.`;
            if (params.cloudCover > 60) {
                explanation += ` Votre couverture nuageuse élevée (${params.cloudCover}%) confirme cette instabilité.`;
            }
            explanation += `</p></div>`;
        } else if (params.pressure > 1020) {
            explanation += `<div class="p-3 rounded-lg border border-gray-500" style="background-color: rgba(51, 51, 51, 0.3);">
                <div class="flex items-center mb-2">
                    <span class="text-lg mr-2">📈</span>
                    <span class="text-white font-semibold">Haute pression (${params.pressure} hPa)</span>
                </div>
                <p class="text-gray-200 text-sm">Cette pression indique un anticyclone stable. Les hautes pressions créent un air descendant qui stabilise l'atmosphère, favorisant le beau temps.`;
            if (params.cloudCover < 40) {
                explanation += ` Votre faible couverture nuageuse (${params.cloudCover}%) confirme ces conditions anticycloniques.`;
            }
            explanation += `</p></div>`;
        } else {
            explanation += `<div class="p-3 rounded-lg border border-gray-500" style="background-color: rgba(51, 51, 51, 0.3);">
                <div class="flex items-center mb-2">
                    <span class="text-lg mr-2">📊</span>
                    <span class="text-white font-semibold">Pression normale (${params.pressure} hPa)</span>
                </div>
                <p class="text-gray-200 text-sm">Cette pression indique des conditions atmosphériques équilibrées.</p>
            </div>`;
        }
        
        // Analyse des précipitations
        if (params.precipitation > 0) {
            explanation += `<div class="p-3 rounded-lg border border-gray-500" style="background-color: rgba(51, 51, 51, 0.3);">
                <div class="flex items-center mb-2">
                    <span class="text-lg mr-2">🌧️</span>
                    <span class="text-white font-semibold">Précipitations (${params.precipitation} mm/h)</span>
                </div>
                <p class="text-gray-200 text-sm">Ces précipitations modifient complètement les conditions. `;
            if (params.precipitation > 10) {
                explanation += `L'intensité élevée crée un temps très humide et réduit significativement la visibilité.`;
            } else {
                explanation += `Cette intensité modérée maintient une humidité élevée tout en préservant une visibilité acceptable.`;
            }
            explanation += `</p></div>`;
        } else {
            explanation += `<div class="p-3 rounded-lg border border-gray-500" style="background-color: rgba(51, 51, 51, 0.3);">
                <div class="flex items-center mb-2">
                    <span class="text-lg mr-2">☀️</span>
                    <span class="text-white font-semibold">Aucune précipitation</span>
                </div>
                <p class="text-gray-200 text-sm">L'absence de pluie maintient des conditions sèches.</p>
            </div>`;
        }
        
        // Analyse de la couverture nuageuse
        if (params.cloudCover > 80) {
            explanation += `<div class="p-3 rounded-lg border border-gray-500" style="background-color: rgba(51, 51, 51, 0.3);">
                <div class="flex items-center mb-2">
                    <span class="text-lg mr-2">☁️</span>
                    <span class="text-white font-semibold">Ciel très nuageux (${params.cloudCover}%)</span>
                </div>
                <p class="text-gray-200 text-sm">Cette couverture dense bloque la majeure partie du rayonnement solaire. Cela maintient une température stable mais réduit l'ensoleillement et peut favoriser l'humidité.</p>
            </div>`;
        } else if (params.cloudCover < 20) {
            explanation += `<div class="p-3 rounded-lg border border-gray-500" style="background-color: rgba(51, 51, 51, 0.3);">
                <div class="flex items-center mb-2">
                    <span class="text-lg mr-2">☀️</span>
                    <span class="text-white font-semibold">Ciel dégagé (${params.cloudCover}%)</span>
                </div>
                <p class="text-gray-200 text-sm">Cette faible couverture permet un ensoleillement maximal. Le rayonnement solaire direct réchauffe efficacement l'atmosphère et améliore la visibilité.</p>
            </div>`;
        } else {
            explanation += `<div class="p-3 rounded-lg border border-gray-500" style="background-color: rgba(51, 51, 51, 0.3);">
                <div class="flex items-center mb-2">
                    <span class="text-lg mr-2">⛅</span>
                    <span class="text-white font-semibold">Ciel partiellement nuageux (${params.cloudCover}%)</span>
                </div>
                <p class="text-gray-200 text-sm">Cette couverture modérée offre un équilibre entre ensoleillement et protection.</p>
            </div>`;
        }
        
        // Analyse du vent
        if (params.windSpeed > 40) {
            explanation += `<div class="p-3 rounded-lg border border-gray-500" style="background-color: rgba(51, 51, 51, 0.3);">
                <div class="flex items-center mb-2">
                    <span class="text-lg mr-2">💨</span>
                    <span class="text-white font-semibold">Vent fort (${params.windSpeed} km/h)</span>
                </div>
                <p class="text-gray-200 text-sm">Cette vitesse crée des conditions venteuses importantes. Le vent fort accélère l'évaporation, modifie la sensation thermique et peut réduire le confort.</p>
            </div>`;
        } else if (params.windSpeed > 15) {
            explanation += `<div class="p-3 rounded-lg border border-gray-500" style="background-color: rgba(51, 51, 51, 0.3);">
                <div class="flex items-center mb-2">
                    <span class="text-lg mr-2">🌬️</span>
                    <span class="text-white font-semibold">Vent modéré (${params.windSpeed} km/h)</span>
                </div>
                <p class="text-gray-200 text-sm">Cette vitesse crée une ventilation naturelle. Le vent modéré améliore la sensation de fraîcheur sans créer d'inconfort majeur.</p>
            </div>`;
        } else {
            explanation += `<div class="p-3 rounded-lg border border-gray-500" style="background-color: rgba(51, 51, 51, 0.3);">
                <div class="flex items-center mb-2">
                    <span class="text-lg mr-2">😶‍🌫️</span>
                    <span class="text-white font-semibold">Vent faible (${params.windSpeed} km/h)</span>
                </div>
                <p class="text-gray-200 text-sm">Cette faible vitesse crée des conditions calmes. L'air peu mobile peut favoriser l'accumulation d'humidité et de chaleur.</p>
            </div>`;
        }
        
        // Synthèse finale
        explanation += `<div class="p-3 rounded-lg border border-emerald-400" style="background-color: rgba(16, 185, 129, 0.1);">
            <div class="flex items-center mb-2">
                <span class="text-lg mr-2">🎯</span>
                <span class="text-emerald-400 font-semibold">Résultat final</span>
            </div>
            <p class="text-gray-200 text-sm">L'interaction de tous ces paramètres crée un <span class="text-emerald-400 font-bold">confort thermique de ${results.comfortIndex.score}/100</span>. `;
        if (results.comfortIndex.score >= 80) {
            explanation += `Ces conditions sont excellentes pour les activités extérieures.</p></div>`;
        } else if (results.comfortIndex.score >= 60) {
            explanation += `Ces conditions sont agréables avec quelques précautions possibles.</p></div>`;
        } else if (results.comfortIndex.score >= 40) {
            explanation += `Ces conditions nécessitent une adaptation pour le confort.</p></div>`;
        } else {
            explanation += `Ces conditions sont difficiles et nécessitent des précautions importantes.</p></div>`;
        }
        
        explanation += `</div>`;
        return explanation;
    }

    // Générer des liens contextuels basés sur les paramètres
    generateContextualLinks(params) {
        let links = [];
        
        // Liens basés sur la température
        if (params.temperature > 30) {
            links.push({
                href: "explication-heat-index.html",
                icon: "🌡️",
                title: "Indice de chaleur",
                description: "Comprendre la chaleur ressentie"
            });
        } else if (params.temperature < 5) {
            links.push({
                href: "explication-wind-chill.html",
                icon: "❄️",
                title: "Refroidissement éolien",
                description: "Effet du vent sur le froid"
            });
        }
        
        // Liens basés sur la pression
        if (params.pressure < 1000) {
            links.push({
                href: "explication-pression.html",
                icon: "📉",
                title: "Pression atmosphérique",
                description: "Systèmes dépressionnaires"
            });
        } else if (params.pressure > 1020) {
            links.push({
                href: "explication-pression.html",
                icon: "📈",
                title: "Pression atmosphérique",
                description: "Anticyclones et stabilité"
            });
        }
        
        // Liens basés sur les précipitations
        if (params.precipitation > 0) {
            links.push({
                href: "explication-eau.html",
                icon: "🌧️",
                title: "Cycle de l'eau",
                description: "Formation des précipitations"
            });
        }
        
        // Liens basés sur la couverture nuageuse
        if (params.cloudCover > 60) {
            links.push({
                href: "explication-phenomenes.html",
                icon: "☁️",
                title: "Types de nuages",
                description: "Classification des nuages"
            });
        } else if (params.cloudCover < 20) {
            links.push({
                href: "explication-uv.html",
                icon: "☀️",
                title: "Indice UV",
                description: "Rayonnement solaire"
            });
        }
        
        // Liens basés sur le vent
        if (params.windSpeed > 30) {
            links.push({
                href: "explication-beaufort.html",
                icon: "💨",
                title: "Échelle de Beaufort",
                description: "Classification des vents"
            });
        }
        
        // Liens généraux toujours présents
        links.push({
            href: "explication-bases-atmosphere.html",
            icon: "🌍",
            title: "Bases atmosphériques",
            description: "Fonctionnement de l'atmosphère"
        });
        
        // Générer le HTML des liens
        let linksHTML = '';
        links.forEach(link => {
            linksHTML += `
                <a href="${link.href}" class="group flex items-center p-3 rounded-lg border border-gray-500 hover:border-emerald-400 transition-all duration-300" style="background-color: rgba(51, 51, 51, 0.5);">
                    <span class="text-xl mr-3">${link.icon}</span>
                    <div>
                        <div class="text-white font-medium group-hover:text-emerald-400 transition-colors">${link.title}</div>
                        <div class="text-xs text-gray-300">${link.description}</div>
                    </div>
                </a>
            `;
        });
        
        return linksHTML;
    }

    // Expliquer la température ressentie
    explainFeelsLike(temp, humidity, windSpeed, feelsLike) {
        if (feelsLike > temp) {
            return `L'humidité élevée (${humidity}%) empêche l'évaporation de la sueur, créant une sensation de chaleur plus intense.`;
        } else if (feelsLike < temp) {
            return `Le vent (${windSpeed} km/h) accélère l'évaporation, créant une sensation de froid plus marquée.`;
        } else {
            return `Les conditions sont équilibrées : ni trop humide, ni trop venteux.`;
        }
    }

    // Expliquer l'indice de confort
    explainComfortIndex(comfort) {
        if (comfort.score >= 80) {
            return `Excellent confort : conditions idéales pour les activités extérieures.`;
        } else if (comfort.score >= 60) {
            return `Bon confort : conditions agréables avec quelques ajustements possibles.`;
        } else if (comfort.score >= 40) {
            return `Confort modéré : conditions acceptables mais attention aux personnes sensibles.`;
        } else {
            return `Confort faible : conditions difficiles, adaptation nécessaire.`;
        }
    }

    // Expliquer la visibilité
    explainVisibility(humidity, precipitation, cloudCover, visibility) {
        if (visibility < 5) {
            return `Visibilité réduite par l'humidité élevée (${humidity}%) et les précipitations (${precipitation} mm/h).`;
        } else if (visibility < 10) {
            return `Visibilité modérée : l'humidité (${humidity}%) et les nuages (${cloudCover}%) limitent la portée visuelle.`;
        } else {
            return `Excellente visibilité : air sec et ciel dégagé.`;
        }
    }

    // Expliquer l'indice UV
    explainUVIndex(cloudCover, uvIndex) {
        if (uvIndex > 8) {
            return `Indice UV très élevé : protection solaire obligatoire, exposition limitée.`;
        } else if (uvIndex > 6) {
            return `Indice UV élevé : protection solaire recommandée.`;
        } else if (uvIndex > 3) {
            return `Indice UV modéré : protection solaire conseillée.`;
        } else {
            return `Indice UV faible : protection solaire non nécessaire.`;
        }
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
