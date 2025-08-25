// Weather API configuration
const WEATHER_CONFIG = {
    API_KEY: '5f5321aa9a6a59d1ab2df5248f5b9c14', // Remplacez par votre clé API OpenWeatherMap
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    UNITS: 'metric',
    LANG: 'fr'
};

// Swiss country configuration
const SWISS_CONFIG = {
    COUNTRY_CODE: 'CH',
    COUNTRY_NAME: 'Switzerland'
};

// Popular Swiss cities for suggestions
const POPULAR_SWISS_CITIES = [
    'Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne', 'Winterthur', 'Lucerne', 'St. Gallen',
    'Lugano', 'Biel', 'Thun', 'Schaffhausen', 'Fribourg', 'Chur', 'Neuchâtel', 'Sion'
];

// Weather icons mapping
const WEATHER_ICONS = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
};

// Weather service class
const WeatherService = {
    // Get current weather data
    getCurrentWeather: function(city, callback) {
        const cityWithCountry = `${city},${SWISS_CONFIG.COUNTRY_CODE}`;
        const url = `${WEATHER_CONFIG.BASE_URL}/weather?q=${encodeURIComponent(cityWithCountry)}&appid=${WEATHER_CONFIG.API_KEY}&units=${WEATHER_CONFIG.UNITS}&lang=${WEATHER_CONFIG.LANG}`;
        
        this.makeAjaxRequest(url, (error, data) => {
            if (error) {
                callback(error, null);
                return;
            }
            
            // Validate that the response is from Switzerland
            if (data.sys && data.sys.country !== SWISS_CONFIG.COUNTRY_CODE) {
                callback(`Cette ville ne se trouve pas en Suisse. Pays détecté: ${data.sys.country}`, null);
                return;
            }
            
            callback(null, data);
        });
    },

    // Get 5-day forecast data
    getForecast: function(city, callback) {
        const cityWithCountry = `${city},${SWISS_CONFIG.COUNTRY_CODE}`;
        const url = `${WEATHER_CONFIG.BASE_URL}/forecast?q=${encodeURIComponent(cityWithCountry)}&appid=${WEATHER_CONFIG.API_KEY}&units=${WEATHER_CONFIG.UNITS}&lang=${WEATHER_CONFIG.LANG}`;
        
        this.makeAjaxRequest(url, (error, data) => {
            if (error) {
                callback(error, null);
                return;
            }
            
            // Validate that the response is from Switzerland
            if (data.city && data.city.country !== SWISS_CONFIG.COUNTRY_CODE) {
                callback(`Cette ville ne se trouve pas en Suisse. Pays détecté: ${data.city.country}`, null);
                return;
            }
            
            callback(null, data);
        });
    },

    // Generic AJAX request function
    makeAjaxRequest: function(url, callback) {
        const xhr = new XMLHttpRequest();
        
        xhr.open('GET', url, true);
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        callback(null, data);
                    } catch (error) {
                        callback('Erreur de parsing des données', null);
                    }
                } else if (xhr.status === 404) {
                    callback('Ville non trouvée', null);
                } else if (xhr.status === 401) {
                    callback('Clé API invalide', null);
                } else {
                    callback('Erreur de connexion à l\'API', null);
                }
            }
        };
        
        xhr.onerror = function() {
            callback('Erreur de réseau', null);
        };
        
        xhr.send();
    }
};

// Weather display functions
const WeatherDisplay = {
    // Show current weather
    displayCurrentWeather: function(data) {
        const cityName = document.getElementById('cityName');
        const currentDate = document.getElementById('currentDate');
        const weatherIcon = document.getElementById('weatherIcon');
        const temperature = document.getElementById('temperature');
        const description = document.getElementById('description');
        const feelsLike = document.getElementById('feelsLike');
        const humidity = document.getElementById('humidity');
        const windSpeed = document.getElementById('windSpeed');
        const pressure = document.getElementById('pressure');

        // Update city name and date
        cityName.textContent = `${data.name}, ${data.sys.country}`;
        currentDate.textContent = this.formatDate(new Date());

        // Update weather info
        weatherIcon.textContent = WEATHER_ICONS[data.weather[0].icon] || '🌤️';
        weatherIcon.className = 'text-8xl mb-4 weather-icon';
        
        temperature.textContent = `${Math.round(data.main.temp)}°C`;
        description.textContent = data.weather[0].description;
        
        feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
        humidity.textContent = `${data.main.humidity}%`;
        windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
        pressure.textContent = `${data.main.pressure} hPa`;

        // Show weather container with animation
        const weatherContainer = document.getElementById('weatherContainer');
        weatherContainer.classList.remove('hidden');
        weatherContainer.classList.add('fade-in');
    },

    // Format date
    formatDate: function(date) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('fr-FR', options);
    },

    // Show loading indicator
    showLoading: function() {
        document.getElementById('loadingIndicator').classList.remove('hidden');
        document.getElementById('weatherContainer').classList.add('hidden');
        document.getElementById('errorMessage').classList.add('hidden');
    },

    // Hide loading indicator
    hideLoading: function() {
        document.getElementById('loadingIndicator').classList.add('hidden');
    },

    // Show error message
    showError: function(message) {
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
        errorMessage.classList.add('error-shake');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            errorMessage.classList.remove('error-shake');
        }, 500);
        
        document.getElementById('weatherContainer').classList.add('hidden');
        this.hideLoading();
    },

    // Hide error message
    hideError: function() {
        document.getElementById('errorMessage').classList.add('hidden');
    }
};

// Swiss city helper
const SwissCityHelper = {
    // Get suggestions for Swiss cities
    getSuggestions: function(input) {
        if (!input || input.length < 2) return [];
        
        const normalizedInput = input.toLowerCase().trim();
        return POPULAR_SWISS_CITIES.filter(city => 
            city.toLowerCase().includes(normalizedInput)
        ).slice(0, 5);
    },

    // Format city name for display
    formatCityName: function(city) {
        return city.trim();
    }
};

// Weather search functionality
const WeatherSearch = {
    // Search for weather data
    searchWeather: function(city) {
        if (!city.trim()) {
            WeatherDisplay.showError('Veuillez entrer le nom d\'une ville');
            return;
        }

        const formattedCity = SwissCityHelper.formatCityName(city);
        
        WeatherDisplay.hideError();
        WeatherDisplay.showLoading();

        // Get current weather - API will validate Swiss location
        WeatherService.getCurrentWeather(formattedCity, (error, currentData) => {
            if (error) {
                WeatherDisplay.showError(error);
                return;
            }
            
            WeatherDisplay.displayCurrentWeather(currentData);

            // Get forecast data for chart
            WeatherService.getForecast(formattedCity, (forecastError, forecastData) => {
                WeatherDisplay.hideLoading();
                
                if (forecastError) {
                    console.warn('Erreur lors du chargement des prévisions:', forecastError);
                    return;
                }

                // Update forecast chart
                if (window.WeatherChart) {
                    WeatherChart.updateChart(forecastData);
                }
            });
        });
    }
};
