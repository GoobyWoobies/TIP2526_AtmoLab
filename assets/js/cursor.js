// Gestionnaire du curseur personnalisé et du mode sombre
class CursorManager {
    constructor() {
        this.cursor = null;
        this.init();
    }

    init() {
        this.createCursor();
        this.bindEvents();
        this.initDarkMode();
    }

    createCursor() {
        this.cursor = document.querySelector('.custom-cursor');
        if (!this.cursor) {
            this.cursor = document.createElement('div');
            this.cursor.className = 'custom-cursor';
            document.body.appendChild(this.cursor);
        }
    }

    bindEvents() {
        // Suivre le mouvement de la souris
        document.addEventListener('mousemove', (e) => {
            this.cursor.style.left = e.clientX - 10 + 'px';
            this.cursor.style.top = e.clientY - 10 + 'px';
        });

        // Effet hover sur les éléments interactifs
        const interactiveElements = document.querySelectorAll('button, a, input, .hover-lift');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.cursor.classList.add('hover');
            });
            
            element.addEventListener('mouseleave', () => {
                this.cursor.classList.remove('hover');
            });
        });

        // Gestion des nouveaux éléments ajoutés dynamiquement
        const observer = new MutationObserver(() => {
            const newElements = document.querySelectorAll('button:not([data-cursor-bound]), a:not([data-cursor-bound]), input:not([data-cursor-bound]), .hover-lift:not([data-cursor-bound])');
            
            newElements.forEach(element => {
                element.setAttribute('data-cursor-bound', 'true');
                
                element.addEventListener('mouseenter', () => {
                    this.cursor.classList.add('hover');
                });
                
                element.addEventListener('mouseleave', () => {
                    this.cursor.classList.remove('hover');
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    initDarkMode() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        const body = document.body;
        
        // Vérifier le mode sombre sauvegardé
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            body.classList.add('dark');
            this.updateDarkModeIcon(true);
        }

        // Gestionnaire du bouton de basculement
        darkModeToggle.addEventListener('click', () => {
            body.classList.toggle('dark');
            const isDark = body.classList.contains('dark');
            
            localStorage.setItem('darkMode', isDark);
            this.updateDarkModeIcon(isDark);
            
            // Animation du bouton
            darkModeToggle.style.transform = 'scale(0.9)';
            setTimeout(() => {
                darkModeToggle.style.transform = 'scale(1)';
            }, 150);
        });
    }

    updateDarkModeIcon(isDark) {
        const darkModeToggle = document.getElementById('darkModeToggle');
        const icon = darkModeToggle.querySelector('svg');
        
        if (isDark) {
            // Icône soleil pour le mode sombre
            icon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            `;
        } else {
            // Icône lune pour le mode clair
            icon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            `;
        }
    }
}

// Gestionnaire de navigation
class NavigationManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindNavigation();
        this.highlightActiveSection();
    }

    bindNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Retirer la classe active de tous les liens
                navLinks.forEach(l => l.classList.remove('text-emerald-600', 'font-bold'));
                navLinks.forEach(l => l.classList.add('text-slate-700', 'font-medium'));
                
                // Ajouter la classe active au lien cliqué
                link.classList.remove('text-slate-700', 'font-medium');
                link.classList.add('text-emerald-600', 'font-bold');
                
                // Animation du lien
                link.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    link.style.transform = 'scale(1)';
                }, 200);
                
                // Ici vous pouvez ajouter la logique pour changer de section
                const section = link.getAttribute('href').substring(1);
                this.showSection(section);
            });
        });
    }

    showSection(sectionName) {
        // Pour l'instant, on affiche juste un message
        // Plus tard, vous pourrez implémenter le changement de contenu
        console.log(`Navigation vers: ${sectionName}`);
        
        // Exemple d'implémentation future:
        // document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
        // document.getElementById(sectionName).classList.remove('hidden');
    }

    highlightActiveSection() {
        // Marquer "Accueil" comme actif par défaut
        const homeLink = document.querySelector('a[href="#accueil"]');
        if (homeLink) {
            homeLink.classList.remove('text-slate-700', 'font-medium');
            homeLink.classList.add('text-emerald-600', 'font-bold');
        }
    }
}

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new CursorManager();
    new NavigationManager();
});
