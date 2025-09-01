class WeatherCompare {
    constructor() {
        this.compareBtn = document.getElementById('compareBtn');
        this.city1Input = document.getElementById('compareCity1');
        this.city2Input = document.getElementById('compareCity2');
        this.resultsContainer = document.getElementById('comparisonResults');
        
        this.init();
    }

    init() {
        this.compareBtn.addEventListener('click', () => this.compareWeather());
        
        // Permettre la comparaison avec Enter
        [this.city1Input, this.city2Input].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.compareWeather();
                }
            });
        });
    }

    async compareWeather() {
        const city1 = this.city1Input.value.trim();
        const city2 = this.city2Input.value.trim();

        if (!city1 || !city2) {
            this.showError('Veuillez entrer deux noms de villes');
            return;
        }

        if (city1.toLowerCase() === city2.toLowerCase()) {
            this.showError('Veuillez choisir deux villes différentes');
            return;
        }

        this.compareBtn.innerHTML = '⏳ Comparaison...';
        this.compareBtn.disabled = true;

        try {
            const [weather1, weather2] = await Promise.all([
                this.getWeatherData(city1),
                this.getWeatherData(city2)
            ]);

            this.displayComparison(weather1, weather2);
        } catch (error) {
            this.showError('Erreur lors de la récupération des données météo');
            console.error('Erreur comparaison:', error);
        } finally {
            this.compareBtn.innerHTML = '🔄 Comparer';
            this.compareBtn.disabled = false;
        }
    }

    getWeatherData(cityName) {
        return new Promise((resolve, reject) => {
            weatherAPI.getCurrentWeather(cityName, 
                (data) => resolve(data),
                (error) => reject(new Error(error))
            );
        });
    }

    displayComparison(weather1, weather2) {
        const temp1 = Math.round(weather1.main.temp);
        const temp2 = Math.round(weather2.main.temp);
        const tempDiff = Math.abs(temp1 - temp2);
        
        // Mise à jour des éléments
        document.getElementById('city1Name').textContent = weather1.name;
        document.getElementById('city1Temp').textContent = `${temp1}°C`;
        document.getElementById('city1Desc').textContent = weather1.weather[0].description;
        
        document.getElementById('city2Name').textContent = weather2.name;
        document.getElementById('city2Temp').textContent = `${temp2}°C`;
        document.getElementById('city2Desc').textContent = weather2.weather[0].description;
        
        // Différence de température
        const warmerCity = temp1 > temp2 ? weather1.name : weather2.name;
        const diffText = tempDiff === 0 ? 
            'Même température' : 
            `${tempDiff}°C (${warmerCity} plus chaud)`;
        
        document.getElementById('tempDifference').textContent = diffText;
        
        // Afficher les résultats
        this.resultsContainer.classList.remove('hidden');
        this.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    showError(message) {
        // Utiliser le système d'erreur existant
        const errorDiv = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        if (errorDiv && errorText) {
            errorText.textContent = message;
            errorDiv.classList.remove('hidden');
            
            setTimeout(() => {
                errorDiv.classList.add('hidden');
            }, 4000);
        }
    }
}

// Initialiser le comparateur quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que weatherAPI soit disponible
    if (typeof weatherAPI !== 'undefined') {
        new WeatherCompare();
    } else {
        // Réessayer après un court délai
        setTimeout(() => {
            if (typeof weatherAPI !== 'undefined') {
                new WeatherCompare();
            }
        }, 1000);
    }
});
