// Classe pour gérer la carte interactive
class WeatherMap {
    constructor() {
        this.map = null;
        this.marker = null;
        this.isInitialized = false;
    }

    // Initialiser la carte
    initMap(containerId, lat = 46.5197, lon = 6.6323) { // Coordonnées par défaut: Lausanne
        if (this.isInitialized) {
            this.map.remove();
        }

        this.map = L.map(containerId).setView([lat, lon], 10);
        
        // Ajouter les tuiles de la carte
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);

        this.isInitialized = true;
    }

    // Mettre à jour la position sur la carte
    updateLocation(lat, lon, cityName) {
        if (!this.isInitialized) {
            return;
        }

        // Supprimer l'ancien marqueur s'il existe
        if (this.marker) {
            this.map.removeLayer(this.marker);
        }

        // Centrer la carte sur la nouvelle position
        this.map.setView([lat, lon], 10);

        // Ajouter un nouveau marqueur
        this.marker = L.marker([lat, lon]).addTo(this.map);
        
        // Ajouter une popup avec le nom de la ville
        this.marker.bindPopup(`<b>${cityName}</b>`).openPopup();
    }

    // Redimensionner la carte (utile après un changement de taille du conteneur)
    resize() {
        if (this.map) {
            setTimeout(() => {
                this.map.invalidateSize();
            }, 100);
        }
    }
}

// Instance globale de la carte
const weatherMap = new WeatherMap();
