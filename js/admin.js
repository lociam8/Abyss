class AdminManager {
    constructor() {
        this.adminKey = 'lociamabyssgod';
        this.adminToken = 'abismo_admin_key';
        this.chatLocked = false;
        this.slowMode = false;
        this.slowModeDelay = 10000; // 10 segundos
        this.bannedUsers = new Set();
        this.lastMessageTime = new Map();
        this.alwaysShowAdmin = true; // Siempre mostrar panel para ti
    }

    initialize() {
        if (this.isAdmin(localStorage.getItem('userToken'))) {
            document.body.classList.add('admin');
            this.setupAdminControls();
        } else if (this.alwaysShowAdmin) {
            // Comprobar si eres tú por la IP o algún otro identificador
            this.checkIfOwner();
        }
    }

    isAdmin(token) {
        return token === this.adminToken;
    }

    // Comprobar si eres el propietario para mostrar panel
    checkIfOwner() {
        // En una implementación real, esto podría verificar la IP u otros datos
        // Para esta demo, simplemente comprobamos si hay una cookie especial
        if (localStorage.getItem('isOwner') === 'true') {
            this.showAdminPanel();
        }

        // Establecer cookie para futuras visitas
        localStorage.setItem('isOwner', 'true');
    }

    showAdminPanel() {
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
            adminPanel.classList.add('visible');
            adminPanel.classList.add('owner-mode');
        }
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

// Sistema de login administrativo
document.addEventListener('DOMContentLoaded', () => {
    const hiddenSymbol = document.getElementById('hiddenSymbol');
    const adminLoginPanel = document.getElementById('adminLoginPanel');

    if (!hiddenSymbol || !adminLoginPanel) {
        console.error('Elementos de administración no encontrados');
        return;
    }

    let clickCount = 0;

    hiddenSymbol.addEventListener('click', () => {
        clickCount++;
        if (clickCount === 3) {
            adminLoginPanel.style.display = 'block';
            hiddenSymbol.style.opacity = '0.5';
            hiddenSymbol.style.color = '#ff0553';
        }
    });

    // Verificar si ya es admin
    if (localStorage.getItem('userToken') === 'abismo_admin_key' || localStorage.getItem('isOwner') === 'true') {
        hiddenSymbol.style.opacity = '0.5';
        hiddenSymbol.style.color = '#ff0553';
        hiddenSymbol.textContent = '⟁';

        // Mostrar panel de admin si es el propietario
        if (localStorage.getItem('isOwner') === 'true') {
            adminManager.showAdminPanel();
        }
    }
});

// Función global para el login
window.loginAsAdmin = function() {
    const adminPassword = document.getElementById('adminPassword');
    if (!adminPassword) {
        console.error('Campo de contraseña no encontrado');
        return;
    }

    if (adminPassword.value === 'lociamabyssgod') {
        localStorage.setItem('userToken', 'abismo_admin_key');
        location.reload();
    } else {
        alert('Los espectros rechazan tu intento de acceso.');
    }
};

// Inicializar el administrador
const adminManager = new AdminManager();
document.addEventListener('DOMContentLoaded', () => adminManager.initialize());

// Modificar la función sendMessage existente
const originalSendMessage = window.sendMessage || function() {};
window.sendMessage = function() {
    // Obtener nombre de usuario del sistema de usuarios
    const currentUser = userManager ? userManager.getCurrentUser() : null;
    const username = currentUser ? currentUser.name : 'Usuario';

    if (adminManager.canUserSendMessage(username)) {
        originalSendMessage();
    }
};

// Función para mostrar usuarios en línea en el panel de admin
function updateOnlineUsersAdmin() {
    if (!userManager) return;

    const onlineUsers = userManager.getOnlineUsers();
    const adminPanel = document.getElementById('adminPanel');

    if (adminPanel) {
        const usersSection = adminPanel.querySelector('.admin-section.users-section') ||
                           createUsersSection(adminPanel);

        const usersList = usersSection.querySelector('.online-users-admin');
        if (usersList) {
            usersList.innerHTML = '';

            if (onlineUsers.length === 0) {
                usersList.innerHTML = '<div class="empty-list">No hay usuarios conectados</div>';
            } else {
                onlineUsers.forEach(user => {
                    const userItem = document.createElement('div');
                    userItem.className = 'online-user-item';
                    userItem.innerHTML = `
                        <span class="username">${user.name}</span>
                        <span class="user-actions">
                            <button onclick="adminManager.banUser(null, '${user.id}')" class="admin-button small">
                                <i class="fas fa-ban"></i>
                            </button>
                            <button onclick="adminManager.promoteUser('${user.id}')" class="admin-button small">
                                <i class="fas fa-arrow-up"></i>
                            </button>
                        </span>
                    `;
                    usersList.appendChild(userItem);
                });
            }
        }
    }
}

// Crear sección de usuarios en el panel de admin
function createUsersSection(adminPanel) {
    const usersSection = document.createElement('div');
    usersSection.className = 'admin-section users-section';
    usersSection.innerHTML = `
        <h5><i class="fas fa-users"></i> Usuarios en Línea</h5>
        <div class="online-users-admin"></div>
    `;

    // Insertar después de la primera sección
    const firstSection = adminPanel.querySelector('.admin-section');
    if (firstSection) {
        firstSection.parentNode.insertBefore(usersSection, firstSection.nextSibling);
    } else {
        adminPanel.querySelector('.admin-controls').appendChild(usersSection);
    }

    return usersSection;
}

// Promover usuario directamente
AdminManager.prototype.promoteUser = function(userId) {
    const onlineUsers = userManager.getOnlineUsers();
    const user = onlineUsers.find(u => u.id === userId);

    if (user) {
        const currentRank = user.rank || 1;
        const newRankId = Math.min(currentRank + 1, 7); // Máximo rango 7 (Lociam)

        try {
            const adminToken = localStorage.getItem('userToken');
            const newRank = rankManager.setUserRank(adminToken, userId, newRankId);

            // Actualizar interfaz
            updateUserRankDisplay(userId, newRank);

            // Notificar
            chatSystem.addSystemMessage(`${user.name} ha sido ascendido a ${newRank.name}`);

            // Actualizar lista de usuarios
            updateOnlineUsersAdmin();
        } catch (error) {
            console.error('Error al promover usuario:', error);
        }
    }
};

// Versión mejorada de banUser para funcionar con ID de usuario
AdminManager.prototype.banUser = function(button, userId) {
    let username;

    if (button) {
        // Versión original desde botón en mensaje
        const message = button.closest('.message');
        username = message.querySelector('.username').textContent;
    } else if (userId) {
        // Versión desde panel de admin con ID
        const onlineUsers = userManager.getOnlineUsers();
        const user = onlineUsers.find(u => u.id === userId);
        if (user) {
            username = user.name;
        }
    }

    if (username) {
        this.bannedUsers.add(username);
        chatSystem.addSystemMessage(`🚫 ${username} ha sido silenciado por un Lociam`);

        // Actualizar lista de usuarios
        updateOnlineUsersAdmin();
    }
};

