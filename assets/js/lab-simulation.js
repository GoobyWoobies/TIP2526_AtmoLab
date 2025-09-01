// Classe pour gérer la simulation météorologique
class WeatherSimulation {
    constructor() {
        this.currentParams = {
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
        
        this.history = [];
        this.presets = {
            sunny: {
                temperature: 28,
                humidity: 45,
                pressure: 1020,
                windSpeed: 8,
                windDirection: 180,
                dewPoint: 15,
                cloudCover: 10,
                precipitation: 0,
                cloudType: 'Aucun',
                solarRadiation: 800,
                name: "Journée ensoleillée"
            },
            rainy: {
                temperature: 15,
                humidity: 85,
                pressure: 995,
                windSpeed: 25,
                windDirection: 270,
                dewPoint: 12,
                cloudCover: 100,
                precipitation: 12,
                cloudType: 'Nimbostratus',
                solarRadiation: 150,
                name: "Temps pluvieux"
            },
            stormy: {
                temperature: 22,
                humidity: 90,
                pressure: 980,
                windSpeed: 65,
                windDirection: 225,
                dewPoint: 20,
                cloudCover: 100,
                precipitation: 25,
                cloudType: 'Cumulonimbus',
                solarRadiation: 100,
                name: "Orage"
            },
            winter: {
                temperature: -5,
                humidity: 70,
                pressure: 1025,
                windSpeed: 15,
                windDirection: 45,
                dewPoint: -8,
                cloudCover: 60,
                precipitation: 2,
                cloudType: 'Stratus',
                solarRadiation: 200,
                name: "Temps hivernal"
            },
            heatwave: {
                temperature: 42,
                humidity: 25,
                pressure: 1008,
                windSpeed: 5,
                windDirection: 90,
                dewPoint: 18,
                cloudCover: 5,
                precipitation: 0,
                cloudType: 'Aucun',
                solarRadiation: 950,
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
        // Conversion approximative W/m² vers indice UV
        let uvIndex = solarRadiation / 25;
        
        // Réduction due à la couverture nuageuse
        uvIndex *= (1 - (cloudCover / 100) * 0.7);
        
        return Math.max(0, Math.min(11, uvIndex));
    }
    
    // Valider et corriger la cohérence des paramètres
    validateAndCorrectParameters() {
        // Corriger le point de rosée s'il est incohérent
        const calculatedDewPoint = this.calculateDewPoint(this.currentParams.temperature, this.currentParams.humidity);
        if (Math.abs(this.currentParams.dewPoint - calculatedDewPoint) > 5) {
            this.currentParams.dewPoint = Math.round(calculatedDewPoint * 10) / 10;
        }
        
        // Ajuster les précipitations selon la couverture nuageuse
        if (this.currentParams.precipitation > 0 && this.currentParams.cloudCover < 30) {
            this.currentParams.cloudCover = Math.max(60, this.currentParams.cloudCover);
        }
        
        // Ajuster le rayonnement solaire selon la couverture nuageuse
        const maxRadiation = 1200 * (1 - this.currentParams.cloudCover / 100);
        if (this.currentParams.solarRadiation > maxRadiation) {
            this.currentParams.solarRadiation = Math.round(maxRadiation);
        }
        
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
        
        // Mise à jour de l'affichage avec les valeurs corrigées
        this.updateDisplay();
        this.updateSliders();
        
        // Mise à jour du mode expert si activé
        if (window.meteoLab && !document.getElementById('expertSection').classList.contains('hidden')) {
            window.meteoLab.displayExpertCalculations();
        }
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
        
        // Nouveaux paramètres
        const dewPointElement = document.getElementById('dewPointValue');
        if (dewPointElement) dewPointElement.textContent = `${this.currentParams.dewPoint}°C`;
        
        const cloudCoverElement = document.getElementById('cloudCoverValue');
        if (cloudCoverElement) cloudCoverElement.textContent = `${this.currentParams.cloudCover}%`;
        
        const precipitationElement = document.getElementById('precipitationValue');
        if (precipitationElement) precipitationElement.textContent = `${this.currentParams.precipitation} mm/h`;
        
        const cloudTypeElement = document.getElementById('cloudTypeValue');
        if (cloudTypeElement) cloudTypeElement.textContent = this.currentParams.cloudType;
        
        const solarRadiationElement = document.getElementById('solarRadiationValue');
        if (solarRadiationElement) solarRadiationElement.textContent = `${this.currentParams.solarRadiation} W/m²`;
    }

    // Mettre à jour les sliders
    updateSliders() {
        document.getElementById('tempSlider').value = this.currentParams.temperature;
        document.getElementById('humiditySlider').value = this.currentParams.humidity;
        document.getElementById('pressureSlider').value = this.currentParams.pressure;
        document.getElementById('windSlider').value = this.currentParams.windSpeed;
        document.getElementById('windDirSlider').value = this.currentParams.windDirection;
        
        // Nouveaux sliders
        const dewPointSlider = document.getElementById('dewPointSlider');
        if (dewPointSlider) dewPointSlider.value = this.currentParams.dewPoint;
        
        const cloudCoverSlider = document.getElementById('cloudCoverSlider');
        if (cloudCoverSlider) cloudCoverSlider.value = this.currentParams.cloudCover;
        
        const precipitationSlider = document.getElementById('precipitationSlider');
        if (precipitationSlider) precipitationSlider.value = this.currentParams.precipitation;
        
        const solarRadiationSlider = document.getElementById('solarRadiationSlider');
        if (solarRadiationSlider) solarRadiationSlider.value = this.currentParams.solarRadiation;
        
        // Sélecteur de type de nuage
        const cloudTypeSelect = document.getElementById('cloudTypeSelect');
        if (cloudTypeSelect) cloudTypeSelect.value = this.currentParams.cloudType;
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
        const { temperature, humidity, pressure, windSpeed, windDirection, dewPoint, cloudCover, precipitation, cloudType, solarRadiation } = this.currentParams;
        
        // Calculs météorologiques précis
        const heatIndex = this.calculateHeatIndex(temperature, humidity);
        const windChill = this.calculateWindChill(temperature, windSpeed);
        const visibility = this.calculateVisibility(humidity, precipitation, cloudCover);
        const uvIndex = this.calculateUVIndex(solarRadiation, cloudCover);
        const seaLevelPressure = this.calculateSeaLevelPressure(pressure);
        
        // Température ressentie (combinaison chaleur et froid)
        const feelsLike = temperature > 27 ? heatIndex : (temperature < 10 ? windChill : temperature);
        
        // Déterminer le type de temps
        let weatherType = this.determineWeatherType(temperature, humidity, pressure, windSpeed, precipitation, cloudCover);
        
        // Calculer l'indice de confort amélioré
        let comfortIndex = this.calculateAdvancedComfortIndex(temperature, humidity, windSpeed, feelsLike, uvIndex);
        
        // Calculer les risques avec plus de précision
        let risks = this.calculateAdvancedRisks(temperature, humidity, pressure, windSpeed, precipitation, solarRadiation, visibility, uvIndex);
        
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
        document.getElementById('simWindDir').textContent = this.getWindDirection(simulation.params.windDirection);
        
        // Nouveaux paramètres
        document.getElementById('simDewPoint').textContent = `${simulation.params.dewPoint}°C`;
        document.getElementById('simCloudCover').textContent = `${simulation.params.cloudCover}%`;
        document.getElementById('simPrecipitation').textContent = `${simulation.params.precipitation} mm/h`;
        document.getElementById('simCloudType').textContent = simulation.params.cloudType;
        document.getElementById('simSolarRadiation').textContent = `${simulation.params.solarRadiation} W/m²`;
        
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
            <div class="mb-3 grid grid-cols-2 gap-2 text-sm">
                <div><span class="font-medium">🌡️ Ressenti:</span> ${results.feelsLike}°C</div>
                <div><span class="font-medium">👁️ Visibilité:</span> ${results.visibility} km</div>
                <div><span class="font-medium">☀️ Indice UV:</span> ${results.uvIndex}/11</div>
                <div><span class="font-medium">📊 Pression mer:</span> ${results.seaLevelPressure} hPa</div>
            </div>
        `;
        
        if (results.risks.length > 0) {
            analysisHTML += '<div class="mb-3"><span class="font-medium">Risques identifiés:</span><ul class="mt-1 space-y-1">';
            results.risks.forEach(risk => {
                let colorClass = 'text-gray-600';
                if (risk.level === 'extrême') colorClass = 'text-red-800 font-bold';
                else if (risk.level === 'élevé') colorClass = 'text-red-600';
                else if (risk.level === 'modéré') colorClass = 'text-yellow-600';
                else if (risk.level === 'faible') colorClass = 'text-green-600';
                
                analysisHTML += `<li class="text-sm ${colorClass}">• <strong>${risk.type}</strong>: ${risk.description}</li>`;
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
