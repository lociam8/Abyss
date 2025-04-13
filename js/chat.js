// Sistema de mensajes del chat
class ChatSystem {
    constructor() {
        this.messages = [];
        this.messageCount = 0;
        this.isInitialized = false;
        this.socket = null; // Para futura implementación de WebSockets
    }

    initialize() {
        if (this.isInitialized) return;

        // Elementos del DOM
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
        this.emojiButton = document.getElementById('emojiButton');
        this.emojiPicker = document.getElementById('emojiPicker');
        this.chatModal = document.getElementById('chatModal');
        this.overlay = document.getElementById('overlay');

        // Verificar elementos necesarios
        if (!this.messageInput || !this.chatMessages) {
            console.error('Elementos del chat no encontrados');
            return;
        }

        // Configurar eventos
        this.setupEventListeners();

        // Mensaje inicial del sistema
        this.addSystemMessage('El canal astral ha sido abierto...');

        // Cargar mensajes guardados
        this.loadSavedMessages();

        this.isInitialized = true;
    }

    setupEventListeners() {
        // Evento para enviar mensaje
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.sendMessage());
        }

        // Enviar con Enter
        if (this.messageInput) {
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        // Selector de emojis
        if (this.emojiButton && this.emojiPicker) {
            this.emojiButton.addEventListener('click', () => {
                this.toggleEmojiPicker();
            });

            // Cerrar al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (this.emojiPicker.style.display === 'block' &&
                    !this.emojiButton.contains(e.target) &&
                    !this.emojiPicker.contains(e.target)) {
                    this.emojiPicker.style.display = 'none';
                }
            });
        }

        // Botones para abrir/cerrar chat
        const openChatBtn = document.querySelector('.open-chat-btn');
        if (openChatBtn) {
            openChatBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openChat();
            });
        }

        // Botón para cerrar chat
        const closeBtn = document.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeChat();
            });
        }
    }

    sendMessage() {
        // Verificar si hay mensaje y usuario
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Verificar si hay usuario logueado
        if (!userManager.getCurrentUser()) {
            this.addSystemMessage('Debes iniciar sesión para enviar mensajes');
            return;
        }

        // Verificar permisos con el adminManager
        const user = userManager.getCurrentUser();
        if (!adminManager.canUserSendMessage(user.name)) {
            return; // El adminManager ya muestra el mensaje de error
        }

        // Crear objeto de mensaje
        const newMessage = {
            id: 'msg_' + Date.now(),
            userId: user.id,
            userName: user.name,
            userRank: user.rank,
            text: message,
            timestamp: new Date().toISOString()
        };

        // Añadir mensaje a la lista
        this.messages.push(newMessage);

        // Mostrar en la interfaz
        this.displayMessage(newMessage);

        // Limpiar input
        this.messageInput.value = '';

        // Incrementar contador de mensajes del usuario
        userManager.incrementMessageCount();

        // Guardar mensajes
        this.saveMessages();

        // Reproducir sonido
        if (typeof playSound === 'function') {
            playSound('message');
        }
    }

    displayMessage(message) {
        if (!this.chatMessages) return;

        try {
            // Obtener información de rango
            let rank;
            if (typeof RANKS !== 'undefined' && RANKS_ARRAY) {
                // Usar el rango del mensaje o el rango por defecto
                const rankId = message.userRank || 1;
                rank = RANKS_ARRAY.find(r => r.id === rankId) || RANKS.INICIADO;
            } else {
                // Fallback si no se encuentra RANKS
                rank = {
                    id: 1,
                    name: "Iniciado",
                    symbol: "●"
                };
            }

            // Crear elemento de mensaje
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.dataset.messageId = message.id;
            messageElement.dataset.userId = message.userId;

            // Contenido HTML
            messageElement.innerHTML = `
                <div class="message-user">
                    <span class="user-rank rank-${rank.id}">
                        <span class="rank-symbol">${rank.symbol}</span>
                        <span class="rank-name">${rank.name}</span>
                    </span>
                    <span class="username">${message.userName}</span>
                </div>
                <div class="message-text">${this.formatMessageText(message.text)}</div>
            `;

            // Añadir al contenedor
            this.chatMessages.appendChild(messageElement);

            // Scroll al final
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

            // Si es admin, añadir controles
            if (typeof userManager !== 'undefined' && userManager.isAdmin && userManager.isAdmin()) {
                if (typeof adminManager !== 'undefined' && adminManager.addMessageControls) {
                    adminManager.addMessageControls(messageElement);
                }
            }
        } catch (e) {
            console.error('Error al mostrar mensaje:', e);
            // Fallback simple
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.innerHTML = `
                <div class="message-user">
                    <span class="username">${message.userName || 'Usuario'}</span>
                </div>
                <div class="message-text">${message.text || ''}</div>
            `;
            this.chatMessages.appendChild(messageElement);
        }
    }

    addSystemMessage(text) {
        if (!this.chatMessages) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'message system';
        messageElement.innerHTML = `
            <div class="message-text">${text}</div>
        `;

        this.chatMessages.appendChild(messageElement);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    formatMessageText(text) {
        // Convertir URLs en enlaces
        text = text.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        // Resaltar palabras clave del abismo
        const keywords = ['abismo', 'vacío', 'sombra', 'ritual', 'lociam', 'espectro'];
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            text = text.replace(regex, `<span class="keyword-highlight">$&</span>`);
        });

        return text;
    }

    toggleEmojiPicker() {
        if (!this.emojiPicker) return;

        if (this.emojiPicker.style.display === 'block') {
            this.emojiPicker.style.display = 'none';
        } else {
            this.emojiPicker.style.display = 'block';
        }
    }

    addEmoji(emoji) {
        if (!this.messageInput) return;

        this.messageInput.value += emoji;
        this.messageInput.focus();

        // Ocultar selector
        if (this.emojiPicker) {
            this.emojiPicker.style.display = 'none';
        }
    }

    openChat() {
        if (this.chatModal && this.overlay) {
            this.chatModal.style.display = 'block';
            this.overlay.style.display = 'block';
        }
    }

    closeChat() {
        if (this.chatModal && this.overlay) {
            this.chatModal.style.display = 'none';
            this.overlay.style.display = 'none';
        }
    }

    saveMessages() {
        // Guardar solo los últimos 50 mensajes para no sobrecargar localStorage
        const messagesToSave = this.messages.slice(-50);
        localStorage.setItem('chatMessages', JSON.stringify(messagesToSave));
    }

    loadSavedMessages() {
        const savedMessages = localStorage.getItem('chatMessages');
        if (savedMessages) {
            try {
                const messages = JSON.parse(savedMessages);
                this.messages = messages;

                // Mostrar mensajes guardados
                messages.forEach(message => {
                    this.displayMessage(message);
                });
            } catch (e) {
                console.error('Error al cargar mensajes:', e);
            }
        }
    }
}

// Función para mostrar/ocultar el panel de admin
function toggleAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel && typeof userManager !== 'undefined' && userManager.isAdmin && userManager.isAdmin()) {
        adminPanel.classList.toggle('visible');
    }
}

// Función para asignar rango
function setUserRank() {
    try {
        const userId = document.getElementById('userSelect').value;
        const rankId = document.getElementById('rankSelect').value;
        const adminToken = localStorage.getItem('userToken');

        if (!userId || !rankId) {
            console.log('Falta usuario o rango');
            if (typeof showNotification === 'function') {
                showNotification('Selecciona un usuario y un rango', 'warning');
            }
            return;
        }

        console.log('Asignando rango:', rankId, 'a usuario:', userId);

        if (typeof rankManager !== 'undefined' && rankManager.setUserRank) {
            const newRank = rankManager.setUserRank(adminToken, userId, parseInt(rankId));
            if (newRank) {
                updateUserRankDisplay(userId, newRank);

                // Actualizar en la lista de usuarios en línea
                if (typeof userManager !== 'undefined' && userManager.getOnlineUsers) {
                    const onlineUsers = userManager.getOnlineUsers();
                    const user = onlineUsers.find(u => u.id === userId);
                    if (user) {
                        user.rank = newRank.id;
                        chatSystem.addSystemMessage(`${user.name} ha sido ascendido a ${newRank.name}`);

                        // Reproducir sonido
                        if (typeof playSound === 'function') {
                            playSound('notification');
                        }
                    }
                }
            } else {
                console.error('Error al asignar rango: rango no válido o sin permisos');
            }
        } else {
            console.error('rankManager no disponible');
        }
    } catch (error) {
        console.error('Error al asignar rango:', error);
        if (typeof showNotification === 'function') {
            showNotification('Error al asignar rango', 'error');
        }
    }
}

// Actualizar visualización del rango de un usuario
function updateUserRankDisplay(userId, newRank) {
    if (!newRank) {
        console.error('Rango no válido');
        return;
    }

    try {
        // Actualizar en mensajes
        document.querySelectorAll(`.message[data-user-id="${userId}"] .user-rank`).forEach(rankElement => {
            rankElement.className = `user-rank rank-${newRank.id}`;
            rankElement.innerHTML = `
                <span class="rank-symbol">${newRank.symbol}</span>
                <span class="rank-name">${newRank.name}</span>
            `;
        });

        // Actualizar en lista de usuarios en línea
        document.querySelectorAll(`#onlineUsersList .online-user[data-user-id="${userId}"] .user-rank`).forEach(rankElement => {
            rankElement.className = `user-rank rank-${newRank.id}`;
            const symbolElement = rankElement.querySelector('.rank-symbol');
            if (symbolElement) {
                symbolElement.textContent = newRank.symbol;
            }
        });

        // Si es el usuario actual, actualizar su perfil
        if (typeof userManager !== 'undefined' && userManager.getCurrentUser) {
            const currentUser = userManager.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                currentUser.rank = newRank.id;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                if (userManager.updateUserInterface) {
                    userManager.updateUserInterface();
                }
            }
        }
    } catch (e) {
        console.error('Error al actualizar visualización de rango:', e);
    }
}

// Crear instancia global del sistema de chat
const chatSystem = new ChatSystem();

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando sistema de chat...');

    // Inicializar sistema de chat
    chatSystem.initialize();

    // Llenar el selector de rangos
    const rankSelect = document.getElementById('rankSelect');
    if (rankSelect) {
        try {
            // Limpiar opciones existentes excepto la primera
            while (rankSelect.options.length > 1) {
                rankSelect.remove(1);
            }

            // Añadir rangos si están disponibles
            if (typeof RANKS !== 'undefined') {
                Object.values(RANKS).forEach(rank => {
                    const option = document.createElement('option');
                    option.value = rank.id;
                    option.textContent = `${rank.symbol} ${rank.name}`;
                    rankSelect.appendChild(option);
                });
            }
        } catch (e) {
            console.error('Error al configurar selector de rangos:', e);
        }
    }

    // Configurar eventos para abrir/cerrar chat
    setupChatEvents();
});

// Configurar eventos del chat
function setupChatEvents() {
    const openChatBtn = document.querySelector('.open-chat-btn');
    const closeBtn = document.querySelector('.close-btn');

    if (openChatBtn) {
        openChatBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.openChat();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.closeChat();
        });
    }
}

// Exponer funciones globalmente
window.sendMessage = function() {
    chatSystem.sendMessage();
};

window.addEmoji = function(emoji) {
    chatSystem.addEmoji(emoji);
};

window.openChat = function() {
    chatSystem.openChat();
};

window.closeChat = function() {
    chatSystem.closeChat();
};
