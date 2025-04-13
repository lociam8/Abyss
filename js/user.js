/**
 * Sistema de usuarios para el Grimorio del Abismo
 * Gestiona el login, registro y sesiones de usuarios
 */

class UserManager {
    constructor() {
        this.currentUser = null;
        this.onlineUsers = new Map(); // Mapa de usuarios conectados
        this.lastActivity = new Map(); // Última actividad de cada usuario
        this.activityCheckInterval = null;
        this.adminKey = 'lociamabyssgod'; // Clave para identificar al admin
    }

    initialize() {
        // Cargar usuario actual desde localStorage
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.updateUserInterface();
            } catch (e) {
                console.error('Error al cargar usuario:', e);
                localStorage.removeItem('currentUser');
            }
        }

        // Configurar formulario de login
        this.setupLoginForm();
        
        // Iniciar comprobación de actividad
        this.startActivityCheck();
        
        // Registrar actividad actual
        this.registerActivity();
        
        // Mostrar panel de admin si corresponde
        this.checkAdminStatus();
    }

    // Configurar formulario de login
    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        const logoutButton = document.getElementById('logoutButton');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('loginUsername').value.trim();
                if (username) {
                    this.login(username);
                }
            });
        }
        
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                this.logout();
            });
        }
        
        // Mostrar u ocultar formulario según estado de login
        this.toggleLoginForm();
    }

    // Login de usuario
    login(username) {
        // Generar ID único para el usuario
        const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Crear objeto de usuario
        this.currentUser = {
            id: userId,
            name: username,
            rank: 1, // Rango inicial: Iniciado
            joinDate: new Date().toISOString(),
            messages: 0,
            rituals: 0
        };
        
        // Guardar en localStorage
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        // Actualizar interfaz
        this.updateUserInterface();
        
        // Registrar usuario en línea
        this.registerOnlineUser();
        
        // Mostrar mensaje de bienvenida
        this.showWelcomeMessage();
        
        // Ocultar formulario de login
        this.toggleLoginForm();
        
        // Mostrar notificación
        if (typeof showNotification === 'function') {
            showNotification(`Bienvenido al Abismo, ${username}`, 'success');
        }
    }

    // Logout de usuario
    logout() {
        // Eliminar de usuarios en línea
        if (this.currentUser) {
            this.removeOnlineUser(this.currentUser.id);
        }
        
        // Limpiar datos de usuario
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        
        // Actualizar interfaz
        this.updateUserInterface();
        
        // Mostrar formulario de login
        this.toggleLoginForm();
        
        // Mostrar notificación
        if (typeof showNotification === 'function') {
            showNotification('Has abandonado el Abismo', 'info');
        }
        
        // Recargar página para reiniciar estado
        window.location.reload();
    }

    // Actualizar interfaz con datos del usuario
    updateUserInterface() {
        const userName = document.getElementById('userName');
        const userRank = document.getElementById('userRank');
        const userMessages = document.getElementById('userMessages');
        const userRitual = document.getElementById('userRitual');
        const profileAvatar = document.querySelector('.profile-avatar i');
        
        if (this.currentUser) {
            // Actualizar nombre
            if (userName) {
                userName.textContent = this.currentUser.name;
            }
            
            // Actualizar rango
            if (userRank) {
                const rank = RANKS[Object.keys(RANKS)[this.currentUser.rank - 1]] || RANKS.INICIADO;
                userRank.className = `user-rank rank-${rank.id}`;
                userRank.innerHTML = `
                    <span class="rank-symbol">${rank.symbol}</span>
                    <span class="rank-name">${rank.name}</span>
                `;
            }
            
            // Actualizar estadísticas
            if (userMessages) {
                userMessages.textContent = this.currentUser.messages || '0';
            }
            
            if (userRitual) {
                userRitual.textContent = this.currentUser.rituals || '0';
            }
            
            // Actualizar avatar según rango
            if (profileAvatar) {
                // Cambiar icono según rango
                if (this.currentUser.rank >= 6) {
                    profileAvatar.className = 'fas fa-crown'; // Lociam o Sacerdote
                } else if (this.currentUser.rank >= 4) {
                    profileAvatar.className = 'fas fa-hat-wizard'; // Rangos intermedios
                } else {
                    profileAvatar.className = 'fas fa-user-circle'; // Rangos iniciales
                }
            }
        } else {
            // Valores por defecto si no hay usuario
            if (userName) userName.textContent = 'Iniciado';
            if (userRank) {
                userRank.className = 'user-rank rank-1';
                userRank.innerHTML = `
                    <span class="rank-symbol">●</span>
                    <span class="rank-name">Iniciado del Eco (Ayr'Lun)</span>
                `;
            }
            if (userMessages) userMessages.textContent = '0';
            if (userRitual) userRitual.textContent = '0';
            if (profileAvatar) profileAvatar.className = 'fas fa-user-circle';
        }
    }

    // Mostrar/ocultar formulario de login
    toggleLoginForm() {
        const loginContainer = document.getElementById('loginContainer');
        const userProfile = document.querySelector('.user-profile');
        
        if (loginContainer && userProfile) {
            if (this.currentUser) {
                loginContainer.style.display = 'none';
                userProfile.style.display = 'block';
            } else {
                loginContainer.style.display = 'block';
                userProfile.style.display = 'none';
            }
        }
    }

    // Mostrar mensaje de bienvenida en el chat
    showWelcomeMessage() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages && this.currentUser) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message system';
            messageElement.innerHTML = `
                <div class="message-text">🌑 ${this.currentUser.name} ha entrado al Canal Astral</div>
            `;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // Registrar usuario en línea
    registerOnlineUser() {
        if (!this.currentUser) return;
        
        // Añadir a la lista de usuarios en línea
        this.onlineUsers.set(this.currentUser.id, {
            id: this.currentUser.id,
            name: this.currentUser.name,
            rank: this.currentUser.rank,
            lastActivity: Date.now()
        });
        
        // Actualizar última actividad
        this.lastActivity.set(this.currentUser.id, Date.now());
        
        // Actualizar lista de usuarios en línea en la interfaz
        this.updateOnlineUsersList();
        
        // Enviar evento de usuario conectado
        this.broadcastUserStatus('connected');
    }

    // Eliminar usuario de la lista de en línea
    removeOnlineUser(userId) {
        if (this.onlineUsers.has(userId)) {
            this.onlineUsers.delete(userId);
            this.lastActivity.delete(userId);
            
            // Actualizar lista de usuarios en línea
            this.updateOnlineUsersList();
            
            // Enviar evento de usuario desconectado
            this.broadcastUserStatus('disconnected');
        }
    }

    // Registrar actividad del usuario
    registerActivity() {
        if (this.currentUser) {
            this.lastActivity.set(this.currentUser.id, Date.now());
        }
        
        // Programar próxima comprobación
        setTimeout(() => this.registerActivity(), 60000); // Cada minuto
    }

    // Iniciar comprobación periódica de actividad
    startActivityCheck() {
        // Comprobar cada 2 minutos
        this.activityCheckInterval = setInterval(() => {
            const now = Date.now();
            
            // Comprobar cada usuario
            this.lastActivity.forEach((lastActivity, userId) => {
                // Si no ha habido actividad en 5 minutos, marcar como desconectado
                if (now - lastActivity > 5 * 60 * 1000) {
                    this.removeOnlineUser(userId);
                }
            });
        }, 2 * 60 * 1000);
    }

    // Actualizar lista de usuarios en línea en la interfaz
    updateOnlineUsersList() {
        const onlineUsersList = document.getElementById('onlineUsersList');
        const userSelect = document.getElementById('userSelect');
        
        // Actualizar lista de usuarios en línea
        if (onlineUsersList) {
            onlineUsersList.innerHTML = '';
            
            if (this.onlineUsers.size === 0) {
                const emptyItem = document.createElement('li');
                emptyItem.className = 'empty-list';
                emptyItem.textContent = 'No hay usuarios conectados';
                onlineUsersList.appendChild(emptyItem);
            } else {
                this.onlineUsers.forEach(user => {
                    const userItem = document.createElement('li');
                    const rank = RANKS[Object.keys(RANKS)[user.rank - 1]] || RANKS.INICIADO;
                    
                    userItem.className = 'online-user';
                    userItem.innerHTML = `
                        <span class="user-rank rank-${rank.id}">
                            <span class="rank-symbol">${rank.symbol}</span>
                        </span>
                        <span class="username">${user.name}</span>
                    `;
                    
                    onlineUsersList.appendChild(userItem);
                });
            }
        }
        
        // Actualizar selector de usuarios para admin
        if (userSelect) {
            // Mantener la primera opción (placeholder)
            const firstOption = userSelect.options[0];
            userSelect.innerHTML = '';
            userSelect.appendChild(firstOption);
            
            // Añadir usuarios en línea
            this.onlineUsers.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.name;
                userSelect.appendChild(option);
            });
        }
    }

    // Enviar evento de cambio de estado de usuario
    broadcastUserStatus(status) {
        // Aquí se implementaría la comunicación con un servidor
        // Para una versión simple, solo actualizamos la interfaz
        if (status === 'connected' && this.currentUser) {
            // Mostrar mensaje en el chat
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                const messageElement = document.createElement('div');
                messageElement.className = 'message system';
                messageElement.innerHTML = `
                    <div class="message-text">🌑 ${this.currentUser.name} ha entrado al Canal Astral</div>
                `;
                chatMessages.appendChild(messageElement);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
    }

    // Incrementar contador de mensajes
    incrementMessageCount() {
        if (this.currentUser) {
            this.currentUser.messages = (this.currentUser.messages || 0) + 1;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.updateUserInterface();
        }
    }

    // Incrementar contador de rituales
    incrementRitualCount() {
        if (this.currentUser) {
            this.currentUser.rituals = (this.currentUser.rituals || 0) + 1;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.updateUserInterface();
        }
    }

    // Verificar si el usuario actual es admin
    isAdmin() {
        return localStorage.getItem('userToken') === 'abismo_admin_key';
    }

    // Comprobar estado de admin y mostrar panel si corresponde
    checkAdminStatus() {
        if (this.isAdmin()) {
            const adminPanel = document.getElementById('adminPanel');
            if (adminPanel) {
                adminPanel.classList.add('visible');
            }
            
            // Añadir clase admin al body
            document.body.classList.add('admin');
        }
    }

    // Obtener usuario actual
    getCurrentUser() {
        return this.currentUser;
    }

    // Obtener lista de usuarios en línea
    getOnlineUsers() {
        return Array.from(this.onlineUsers.values());
    }
}

// Crear instancia global
const userManager = new UserManager();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    userManager.initialize();
    
    // Añadir formulario de login si no existe
    if (!document.getElementById('loginContainer')) {
        createLoginForm();
    }
});

// Crear formulario de login si no existe en el HTML
function createLoginForm() {
    const mainContainer = document.querySelector('.main-container');
    
    if (mainContainer) {
        const loginContainer = document.createElement('div');
        loginContainer.id = 'loginContainer';
        loginContainer.className = 'login-container';
        
        loginContainer.innerHTML = `
            <div class="login-header">
                <h3><i class="fas fa-book-dead"></i> Acceso al Grimorio</h3>
            </div>
            <form id="loginForm" class="login-form">
                <div class="form-group">
                    <label for="loginUsername">Nombre de Iniciado</label>
                    <input type="text" id="loginUsername" placeholder="Ingresa tu nombre..." required>
                </div>
                <button type="submit" class="login-button">
                    <i class="fas fa-door-open"></i> Entrar al Abismo
                </button>
            </form>
            <div class="login-footer">
                <p>Al ingresar, aceptas ser consumido por el Abismo</p>
            </div>
        `;
        
        // Insertar antes del grimorio
        const grimorio = document.querySelector('.grimorio');
        if (grimorio) {
            mainContainer.insertBefore(loginContainer, grimorio);
        } else {
            mainContainer.appendChild(loginContainer);
        }
        
        // Ocultar grimorio hasta login
        if (grimorio && !userManager.getCurrentUser()) {
            grimorio.style.display = 'none';
        }
    }
}

// Añadir sección de usuarios en línea
document.addEventListener('DOMContentLoaded', () => {
    // Crear contenedor de usuarios en línea si no existe
    if (!document.getElementById('onlineUsersContainer')) {
        const chatContainer = document.querySelector('.chat-container');
        
        if (chatContainer) {
            const onlineUsersContainer = document.createElement('div');
            onlineUsersContainer.id = 'onlineUsersContainer';
            onlineUsersContainer.className = 'online-users-container';
            
            onlineUsersContainer.innerHTML = `
                <div class="online-users-header">
                    <h4><i class="fas fa-users"></i> Presencias en el Canal</h4>
                </div>
                <ul id="onlineUsersList" class="online-users-list">
                    <li class="empty-list">No hay usuarios conectados</li>
                </ul>
            `;
            
            chatContainer.appendChild(onlineUsersContainer);
        }
    }
});
