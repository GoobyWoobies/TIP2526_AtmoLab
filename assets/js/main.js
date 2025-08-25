// Main application initialization and event handlers
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const cityInput = document.getElementById('cityInput');
    const searchBtn = document.getElementById('searchBtn');
    
    // Initialize application
    initializeApp();
    
    // Event listeners
    function initializeApp() {
        // Search button click event
        searchBtn.addEventListener('click', handleSearch);
        
        // Enter key press in input field
        cityInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                handleSearch();
            }
        });
        
        // Input field focus animation
        cityInput.addEventListener('focus', function() {
            this.parentElement.classList.add('scale-105');
        });
        
        cityInput.addEventListener('blur', function() {
            this.parentElement.classList.remove('scale-105');
        });
        
        // Initialize chart on page load
        if (window.WeatherChart) {
            WeatherChart.initChart();
        }
        
        // Add Swiss city suggestions and autocomplete
        addSwissCitySuggestions();
        setupAutocomplete();
    }
    
    // Handle search functionality
    function handleSearch() {
        const city = cityInput.value.trim();
        
        if (!city) {
            showInputError('Veuillez entrer le nom d\'une ville');
            return;
        }
        
        // Clear any previous input errors
        clearInputError();
        
        // Disable search button during search
        searchBtn.disabled = true;
        searchBtn.textContent = 'Recherche...';
        searchBtn.classList.add('opacity-75');
        
        // Perform weather search
        WeatherSearch.searchWeather(city);
        
        // Re-enable search button after a delay
        setTimeout(() => {
            searchBtn.disabled = false;
            searchBtn.textContent = 'Rechercher';
            searchBtn.classList.remove('opacity-75');
        }, 2000);
    }
    
    // Show input validation error
    function showInputError(message) {
        cityInput.classList.add('border-red-500', 'bg-red-50');
        cityInput.placeholder = message;
        
        setTimeout(() => {
            clearInputError();
        }, 3000);
    }
    
    // Clear input validation error
    function clearInputError() {
        cityInput.classList.remove('border-red-500', 'bg-red-50');
        cityInput.placeholder = 'Rechercher une ville...';
    }
    
    // Add Swiss cities suggestions
    function addSwissCitySuggestions() {
        const swissCitiesContainer = document.getElementById('swissCities');
        
        if (!swissCitiesContainer) return;
        
        // Add popular Swiss city buttons
        POPULAR_SWISS_CITIES.forEach(city => {
            const cityButton = document.createElement('button');
            cityButton.className = 'px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-full transition-all duration-300 hover:scale-105 border border-gray-600 hover:border-gray-500';
            cityButton.textContent = city;
            cityButton.addEventListener('click', () => {
                cityInput.value = city;
                handleSearch();
            });
            
            swissCitiesContainer.appendChild(cityButton);
        });
    }

    // Add autocomplete functionality
    function setupAutocomplete() {
        let suggestionsList = null;
        
        cityInput.addEventListener('input', function() {
            const inputValue = this.value.trim();
            
            // Remove existing suggestions
            if (suggestionsList) {
                suggestionsList.remove();
                suggestionsList = null;
            }
            
            if (inputValue.length < 2) return;
            
            // Get Swiss city suggestions
            const suggestions = SwissCityHelper.getSuggestions(inputValue);
            
            if (suggestions.length > 0) {
                // Create suggestions dropdown
                suggestionsList = document.createElement('div');
                suggestionsList.className = 'absolute top-full left-0 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 mt-2 z-50 max-h-48 overflow-y-auto';
                
                suggestions.forEach((city, index) => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.className = 'px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200 flex items-center space-x-2';
                    suggestionItem.innerHTML = `
                        <span class="text-lg">🏔️</span>
                        <span class="text-gray-800 font-medium">${city}</span>
                        <span class="text-gray-500 text-sm ml-auto">Suisse</span>
                    `;
                    
                    suggestionItem.addEventListener('click', () => {
                        cityInput.value = city;
                        suggestionsList.remove();
                        suggestionsList = null;
                        handleSearch();
                    });
                    
                    suggestionsList.appendChild(suggestionItem);
                });
                
                // Position suggestions relative to input
                const inputContainer = cityInput.parentElement;
                inputContainer.style.position = 'relative';
                inputContainer.appendChild(suggestionsList);
            }
        });
        
        // Close suggestions when clicking outside
        document.addEventListener('click', function(event) {
            if (suggestionsList && !cityInput.contains(event.target) && !suggestionsList.contains(event.target)) {
                suggestionsList.remove();
                suggestionsList = null;
            }
        });
        
        // Handle keyboard navigation
        cityInput.addEventListener('keydown', function(event) {
            if (!suggestionsList) return;
            
            const items = suggestionsList.querySelectorAll('div');
            let selectedIndex = Array.from(items).findIndex(item => item.classList.contains('bg-gray-100'));
            
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                if (selectedIndex < items.length - 1) {
                    if (selectedIndex >= 0) items[selectedIndex].classList.remove('bg-gray-100');
                    selectedIndex++;
                    items[selectedIndex].classList.add('bg-gray-100');
                }
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                if (selectedIndex > 0) {
                    items[selectedIndex].classList.remove('bg-gray-100');
                    selectedIndex--;
                    items[selectedIndex].classList.add('bg-gray-100');
                }
            } else if (event.key === 'Enter' && selectedIndex >= 0) {
                event.preventDefault();
                items[selectedIndex].click();
            } else if (event.key === 'Escape') {
                suggestionsList.remove();
                suggestionsList = null;
            }
        });
    }
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Ctrl/Cmd + K to focus search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            cityInput.focus();
            cityInput.select();
        }
        
        // Escape to clear search
        if (event.key === 'Escape') {
            cityInput.value = '';
            cityInput.blur();
            
            // Hide weather container
            const weatherContainer = document.getElementById('weatherContainer');
            const errorMessage = document.getElementById('errorMessage');
            
            weatherContainer.classList.add('hidden');
            errorMessage.classList.add('hidden');
        }
    });
    
    // Add smooth scrolling to weather results
    function scrollToWeather() {
        const weatherContainer = document.getElementById('weatherContainer');
        if (!weatherContainer.classList.contains('hidden')) {
            weatherContainer.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    // Override the original displayCurrentWeather to add scroll
    const originalDisplayCurrentWeather = WeatherDisplay.displayCurrentWeather;
    WeatherDisplay.displayCurrentWeather = function(data) {
        originalDisplayCurrentWeather.call(this, data);
        
        // Scroll to results after a short delay
        setTimeout(scrollToWeather, 300);
    };
    
    // Add loading animation improvements
    const originalShowLoading = WeatherDisplay.showLoading;
    WeatherDisplay.showLoading = function() {
        originalShowLoading.call(this);
        
        // Add pulse animation to search button
        searchBtn.classList.add('pulse');
    };
    
    const originalHideLoading = WeatherDisplay.hideLoading;
    WeatherDisplay.hideLoading = function() {
        originalHideLoading.call(this);
        
        // Remove pulse animation from search button
        searchBtn.classList.remove('pulse');
    };
    
    // Add weather data refresh functionality
    let currentCity = '';
    let refreshInterval = null;
    
    // Store current city for refresh
    const originalSearchWeather = WeatherSearch.searchWeather;
    WeatherSearch.searchWeather = function(city) {
        currentCity = city;
        originalSearchWeather.call(this, city);
        
        // Set up auto-refresh every 10 minutes
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
        
        refreshInterval = setInterval(() => {
            if (currentCity && !document.getElementById('weatherContainer').classList.contains('hidden')) {
                console.log('Actualisation automatique des données météo...');
                originalSearchWeather.call(this, currentCity);
            }
        }, 600000); // 10 minutes
    };
    
    // Clean up interval when page is about to unload
    window.addEventListener('beforeunload', () => {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
    });
    
    // Add touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', function(event) {
        touchStartX = event.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', function(event) {
        touchEndX = event.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 100;
        const swipeDistance = touchEndX - touchStartX;
        
        // Swipe right to clear search
        if (swipeDistance > swipeThreshold) {
            cityInput.value = '';
            const weatherContainer = document.getElementById('weatherContainer');
            const errorMessage = document.getElementById('errorMessage');
            
            weatherContainer.classList.add('hidden');
            errorMessage.classList.add('hidden');
        }
    }
    
    console.log('🌤️ AtmoLab Weather App initialized successfully!');
    console.log('💡 Tip: Use Ctrl+K to quickly focus the search bar');
    console.log('💡 Tip: Press Escape to clear the search');
    console.log('💡 Tip: Swipe right on mobile to clear results');
});
