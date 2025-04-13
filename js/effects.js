// Configuración de partículas
particlesJS('particles-js', {
    particles: {
        number: {
            value: 50,
            density: {
                enable: true,
                value_area: 800
            }
        },
        color: {
            value: '#ff0000'
        },
        shape: {
            type: 'circle'
        },
        opacity: {
            value: 0.5,
            random: true
        },
        size: {
            value: 3,
            random: true
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: '#ff0000',
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: true,
            straight: false,
            out_mode: 'out',
            bounce: false
        }
    },
    interactivity: {
        detect_on: 'canvas',
        events: {
            onhover: {
                enable: true,
                mode: 'repulse'
            },
            onclick: {
                enable: true,
                mode: 'push'
            },
            resize: true
        }
    },
    retina_detect: true
});

// Efectos de sonido
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function createMagicalSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Efectos de hover en las tarjetas de conjuros
document.querySelectorAll('.spell-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        createMagicalSound();
        card.querySelector('.spell-icon').style.transform = 'scale(1.2) rotate(360deg)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.querySelector('.spell-icon').style.transform = 'scale(1) rotate(0deg)';
    });
});

// Portal místico
const portalButton = document.querySelector('.portal-button');
if (portalButton) {
    portalButton.addEventListener('click', () => {
        createMagicalSound();
        document.querySelector('.portal-energy').style.transform = 'scale(1.5)';
        setTimeout(() => {
            document.querySelector('.portal-energy').style.transform = 'scale(1)';
        }, 500);
    });
}

// Tema oscuro/claro
const toggleTheme = document.getElementById('toggleTheme');
if (toggleTheme) {
    toggleTheme.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        toggleTheme.querySelector('i').classList.toggle('fa-moon');
        toggleTheme.querySelector('i').classList.toggle('fa-sun');
    });
}

// Control de sonido
let soundEnabled = true;
const toggleSound = document.getElementById('toggleSound');
if (toggleSound) {
    toggleSound.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        toggleSound.querySelector('i').classList.toggle('fa-volume-up');
        toggleSound.querySelector('i').classList.toggle('fa-volume-mute');
    });
}

// Animación de runas flotantes
document.querySelectorAll('.rune').forEach(rune => {
    setInterval(() => {
        rune.style.transform = `translateY(${Math.random() * 20 - 10}px)`;
    }, 2000);
});

// Efecto de resplandor en hover para elementos místicos
document.querySelectorAll('.mystical-element').forEach(element => {
    element.addEventListener('mouseover', () => {
        element.style.textShadow = '0 0 10px var(--color-oro)';
    });
    
    element.addEventListener('mouseout', () => {
        element.style.textShadow = 'none';
    });
});