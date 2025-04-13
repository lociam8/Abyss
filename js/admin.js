class AdminManager {
    constructor() {
        this.adminKey = 'lociamabyssgod';
        this.chatLocked = false;
        this.slowMode = false;
        this.slowModeDelay = 10000; // 10 segundos
        this.bannedUsers = new Set();
        this.lastMessageTime = new Map();
    }

    initialize() {
        if (this.isAdmin(localStorage.getItem('userToken'))) {
            document.body.classList.add('admin');
            this.setupAdminControls();
        }
    }

    isAdmin(token) {
        return token === this.adminKey;
    }

    setupAdminControls() {
        // Mostrar panel de admin
        document.getElementById('adminPanel').classList.add('visible');
        
        // Agregar acciones a los mensajes
        document.querySelectorAll('.message').forEach(msg => {
            this.addMessageControls(msg);
        });
    }

    addMessageControls(messageElement) {
        const actions = document.createElement('div');
        actions.className = 'message-actions';
        actions.innerHTML = `
            <button class="action-button" onclick="adminManager.deleteMessage(this)">🗑️</button>
            <button class="action-button" onclick="adminManager.banUser(this)">🚫</button>
            <button class="action-button" onclick="adminManager.pinMessage(this)">📌</button>
        `;
        messageElement.appendChild(actions);
    }

    toggleChatLock() {
        this.chatLocked = !this.chatLocked;
        const button = document.getElementById('lockButton');
        button.textContent = this.chatLocked ? 'Desbloquear Canal' : 'Bloquear Canal';
        this.announceSystemMessage(
            this.chatLocked 
                ? '🔒 El canal ha sido bloqueado por un Lociam' 
                : '🔓 El canal ha sido desbloqueado'
        );
    }

    toggleSlowMode() {
        this.slowMode = !this.slowMode;
        const button = document.getElementById('slowModeButton');
        button.textContent = this.slowMode ? 'Desactivar Modo Lento' : 'Modo Lento';
        this.announceSystemMessage(
            this.slowMode 
                ? '⏳ Modo lento activado (10 segundos entre mensajes)' 
                : '⚡ Modo lento desactivado'
        );
    }

    clearChat() {
        if (confirm('¿Estás seguro de que deseas purgar el canal?')) {
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.innerHTML = '';
            this.announceSystemMessage('🔥 El canal ha sido purgado por un Lociam');
        }
    }

    deleteMessage(button) {
        const message = button.closest('.message');
        message.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => message.remove(), 300);
    }

    banUser(button) {
        const message = button.closest('.message');
        const username = message.querySelector('.username').textContent;
        this.bannedUsers.add(username);
        this.announceSystemMessage(`🚫 ${username} ha sido silenciado por un Lociam`);
    }

    pinMessage(button) {
        const message = button.closest('.message');
        const pinnedMessage = message.cloneNode(true);
        pinnedMessage.classList.add('pinned');
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.insertBefore(pinnedMessage, chatMessages.firstChild);
    }

    announceSystemMessage(text) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message system';
        messageElement.innerHTML = `
            <div class="message-text">${text}</div>
        `;
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    canUserSendMessage(username) {
        if (this.chatLocked && !this.isAdmin(localStorage.getItem('userToken'))) {
            this.announceSystemMessage('❌ El canal está bloqueado');
            return false;
        }

        if (this.bannedUsers.has(username)) {
            this.announceSystemMessage('❌ Has sido silenciado');
            return false;
        }

        if (this.slowMode) {
            const lastMessage = this.lastMessageTime.get(username) || 0;
            const now = Date.now();
            if (now - lastMessage < this.slowModeDelay) {
                this.announceSystemMessage('⏳ Debes esperar para enviar otro mensaje');
                return false;
            }
            this.lastMessageTime.set(username, now);
        }

        return true;
    }
}

// Inicializar el administrador
const adminManager = new AdminManager();
document.addEventListener('DOMContentLoaded', () => adminManager.initialize());

// Modificar la función sendMessage existente
const originalSendMessage = window.sendMessage;
window.sendMessage = function() {
    const username = 'Usuario'; // Reemplazar con el nombre real del usuario
    if (adminManager.canUserSendMessage(username)) {
        originalSendMessage();
    }
};

// Sistema de login administrativo
let clickCount = 0;
const hiddenSymbol = document.getElementById('hiddenSymbol');
const adminLoginPanel = document.getElementById('adminLoginPanel');

hiddenSymbol.addEventListener('click', () => {
    clickCount++;
    if (clickCount === 3) {
        adminLoginPanel.style.display = 'block';
        hiddenSymbol.style.opacity = '0.5';
        hiddenSymbol.style.color = '#ff0553';
    }
});

function loginAsAdmin() {
    const password = document.getElementById('adminPassword').value;
    if (password === 'lociamabyssgod') { // Esta es la contraseña que deberás usar
        localStorage.setItem('userToken', 'abismo_admin_key');
        location.reload();
    } else {
        alert('Los espectros rechazan tu intento de acceso.');
    }
}

// Verificar si ya es admin al cargar
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('userToken') === 'abismo_admin_key') {
        hiddenSymbol.style.opacity = '0.5';
        hiddenSymbol.style.color = '#ff0553';
        hiddenSymbol.textContent = '⟁';
    }
});
