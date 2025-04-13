/**
 * Sistema de temas para el Grimorio del Abismo
 * Permite cambiar entre diferentes temas visuales
 */

class ThemeManager {
    constructor() {
        this.currentTheme = 'dark'; // Tema por defecto
        this.themes = {
            dark: {
                name: 'Oscuridad Abismal',
                icon: 'fa-moon',
                colors: {
                    background: '#000000',
                    text: '#ffffff',
                    accent: '#ff0000',
                    secondary: '#ff8a00'
                }
            },
            blood: {
                name: 'Sangre Ritual',
                icon: 'fa-droplet',
                colors: {
                    background: '#1a0000',
                    text: '#ffffff',
                    accent: '#8a0303',
                    secondary: '#ff4040'
                }
            },
            void: {
                name: 'Vacío Primordial',
                icon: 'fa-skull',
                colors: {
                    background: '#0a001a',
                    text: '#e0e0ff',
                    accent: '#6600cc',
                    secondary: '#9966ff'
                }
            },
            ancient: {
                name: 'Pergamino Ancestral',
                icon: 'fa-scroll',
                colors: {
                    background: '#2a1a0a',
                    text: '#e0d0b0',
                    accent: '#8a5a00',
                    secondary: '#c09048'
                }
            }
        };
    }

    initialize() {
        // Cargar tema guardado
        const savedTheme = localStorage.getItem('selectedTheme');
        if (savedTheme && this.themes[savedTheme]) {
            this.currentTheme = savedTheme;
        }
        
        // Aplicar tema inicial
        this.applyTheme(this.currentTheme);
        
        // Configurar botón de cambio de tema
        this.setupThemeToggle();
        
        // Crear selector de temas
        this.createThemeSelector();
    }

    applyTheme(themeName) {
        if (!this.themes[themeName]) return;
        
        const theme = this.themes[themeName];
        this.currentTheme = themeName;
        
        // Guardar preferencia
        localStorage.setItem('selectedTheme', themeName);
        
        // Aplicar variables CSS
        document.documentElement.style.setProperty('--color-background', theme.colors.background);
        document.documentElement.style.setProperty('--color-text', theme.colors.text);
        document.documentElement.style.setProperty('--color-accent', theme.colors.accent);
        document.documentElement.style.setProperty('--color-secondary', theme.colors.secondary);
        
        // Actualizar clases en el body
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${themeName}`);
        
        // Actualizar icono del botón
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.innerHTML = `<i class="fas ${theme.icon}"></i>`;
            themeToggle.title = `Tema actual: ${theme.name}`;
        }
        
        // Actualizar selector si existe
        const themeSelector = document.getElementById('themeSelector');
        if (themeSelector) {
            themeSelector.value = themeName;
        }
        
        // Evento personalizado
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeName } }));
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        // Actualizar icono inicial
        const currentTheme = this.themes[this.currentTheme];
        themeToggle.innerHTML = `<i class="fas ${currentTheme.icon}"></i>`;
        themeToggle.title = `Tema actual: ${currentTheme.name}`;
        
        // Evento de clic para mostrar selector
        themeToggle.addEventListener('click', () => {
            const themeSelector = document.getElementById('themeSelector');
            if (themeSelector) {
                themeSelector.style.display = themeSelector.style.display === 'block' ? 'none' : 'block';
            } else {
                // Si no existe el selector, rotar entre temas
                this.cycleTheme();
            }
        });
    }

    createThemeSelector() {
        // Crear contenedor si no existe
        let themeSelector = document.getElementById('themeSelector');
        
        if (!themeSelector) {
            themeSelector = document.createElement('div');
            themeSelector.id = 'themeSelector';
            themeSelector.className = 'theme-selector';
            
            // Añadir opciones
            Object.keys(this.themes).forEach(themeName => {
                const theme = this.themes[themeName];
                const option = document.createElement('div');
                option.className = `theme-option ${themeName === this.currentTheme ? 'active' : ''}`;
                option.dataset.theme = themeName;
                option.innerHTML = `
                    <i class="fas ${theme.icon}"></i>
                    <span>${theme.name}</span>
                `;
                option.addEventListener('click', () => {
                    this.applyTheme(themeName);
                    themeSelector.style.display = 'none';
                    
                    // Actualizar clase activa
                    document.querySelectorAll('.theme-option').forEach(opt => {
                        opt.classList.remove('active');
                    });
                    option.classList.add('active');
                });
                
                themeSelector.appendChild(option);
            });
            
            // Añadir al DOM
            const themeSwitcher = document.querySelector('.theme-switcher');
            if (themeSwitcher) {
                themeSwitcher.appendChild(themeSelector);
            } else {
                document.body.appendChild(themeSelector);
            }
        }
        
        // Cerrar al hacer clic fuera
        document.addEventListener('click', (e) => {
            const themeToggle = document.getElementById('themeToggle');
            if (themeSelector.style.display === 'block' && 
                !themeSelector.contains(e.target) && 
                !themeToggle.contains(e.target)) {
                themeSelector.style.display = 'none';
            }
        });
    }

    cycleTheme() {
        const themeNames = Object.keys(this.themes);
        const currentIndex = themeNames.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeNames.length;
        const nextTheme = themeNames[nextIndex];
        
        this.applyTheme(nextTheme);
        
        // Mostrar notificación
        if (typeof showNotification === 'function') {
            showNotification(`Tema cambiado a: ${this.themes[nextTheme].name}`, 'info');
        }
    }
}

// Crear instancia global
const themeManager = new ThemeManager();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    themeManager.initialize();
    
    // Añadir efectos visuales adicionales
    setupVisualEffects();
});

// Configurar efectos visuales adicionales
function setupVisualEffects() {
    // Efecto de página de grimorio
    setupPageTurnEffect();
    
    // Efecto de resplandor para elementos místicos
    setupGlowEffects();
    
    // Animación de runas
    setupRuneAnimations();
}

// Efecto de cambio de página
function setupPageTurnEffect() {
    const grimorio = document.querySelector('.grimorio');
    if (!grimorio) return;
    
    // Añadir botones de navegación si no existen
    if (!document.querySelector('.page-nav')) {
        const pageNav = document.createElement('div');
        pageNav.className = 'page-nav';
        pageNav.innerHTML = `
            <button class="page-btn prev-page" title="Página anterior">
                <i class="fas fa-chevron-left"></i>
            </button>
            <span class="page-indicator">Página 1</span>
            <button class="page-btn next-page" title="Página siguiente">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        grimorio.appendChild(pageNav);
        
        // Configurar eventos
        const prevBtn = pageNav.querySelector('.prev-page');
        const nextBtn = pageNav.querySelector('.next-page');
        const pageIndicator = pageNav.querySelector('.page-indicator');
        
        let currentPage = 1;
        
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                pageIndicator.textContent = `Página ${currentPage}`;
                animatePageTurn('left');
            }
        });
        
        nextBtn.addEventListener('click', () => {
            currentPage++;
            pageIndicator.textContent = `Página ${currentPage}`;
            animatePageTurn('right');
        });
    }
}

// Animación de cambio de página
function animatePageTurn(direction) {
    const grimorio = document.querySelector('.grimorio');
    if (!grimorio) return;
    
    // Crear elemento para la animación
    const pageTurn = document.createElement('div');
    pageTurn.className = `page-turn ${direction}`;
    grimorio.appendChild(pageTurn);
    
    // Reproducir sonido
    if (typeof playSound === 'function') {
        playSound('page');
    }
    
    // Eliminar después de la animación
    setTimeout(() => {
        pageTurn.remove();
    }, 1000);
}

// Efectos de resplandor
function setupGlowEffects() {
    // Añadir efecto a elementos místicos
    const mysticElements = document.querySelectorAll('.simbolo-arcano, .ritual-circle, .spell-card');
    
    mysticElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.classList.add('glow-effect');
        });
        
        element.addEventListener('mouseleave', () => {
            element.classList.remove('glow-effect');
        });
    });
}

// Animaciones de runas
function setupRuneAnimations() {
    const runeElements = document.querySelectorAll('.rune-ring, .runas-giratorias');
    
    runeElements.forEach(element => {
        // Añadir clase para activar animación
        element.classList.add('animate-runes');
        
        // Evento al hacer clic
        element.addEventListener('click', () => {
            element.classList.add('rune-pulse');
            
            // Reproducir sonido
            if (typeof playSound === 'function') {
                playSound('rune');
            }
            
            // Quitar clase después de la animación
            setTimeout(() => {
                element.classList.remove('rune-pulse');
            }, 1000);
        });
    });
}
