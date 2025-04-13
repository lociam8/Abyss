const rankManager = new RankManager();

// Función para mostrar/ocultar el panel de admin
function toggleAdminPanel() {
    if (rankManager.isAdmin(localStorage.getItem('userToken'))) {
        document.getElementById('adminPanel').classList.toggle('visible');
    }
}

// Función para asignar rango
function setUserRank() {
    const userId = document.getElementById('userSelect').value;
    const rankId = document.getElementById('rankSelect').value;
    const adminToken = localStorage.getItem('userToken');

    try {
        const newRank = rankManager.setUserRank(adminToken, userId, parseInt(rankId));
        updateUserRankDisplay(userId, newRank);
    } catch (error) {
        console.error(error);
    }
}

// Función para crear un mensaje con el rango correcto
function createMessage(user, text) {
    const rank = rankManager.getUserRank(user.id);
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = `
        <div class="message-user">
            <span class="user-rank rank-${rank.id}">
                <span class="rank-symbol">${rank.symbol}</span>
                <span class="rank-name">${rank.name}</span>
            </span>
            <span class="username">${user.name}</span>
        </div>
        <div class="message-text">${text}</div>
    `;
    return messageElement;
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el usuario es admin
    const adminToken = localStorage.getItem('userToken');
    if (rankManager.isAdmin(adminToken)) {
        document.getElementById('adminPanel').classList.add('visible');
    }

    // Llenar el selector de rangos
    const rankSelect = document.getElementById('rankSelect');
    Object.values(RANKS).forEach(rank => {
        const option = document.createElement('option');
        option.value = rank.id;
        option.textContent = `${rank.symbol} ${rank.name}`;
        rankSelect.appendChild(option);
    });

    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');

    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `
            <div class="message-user">
                <span class="username">Iniciado</span>
            </div>
            <div class="message-text">${message}</div>
        `;

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        messageInput.value = '';
    }

    // Evento click para el botón de enviar
    sendButton.addEventListener('click', sendMessage);

    // Evento para enviar con Enter
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Mensaje inicial del sistema
    const systemMessage = document.createElement('div');
    systemMessage.className = 'message system';
    systemMessage.innerHTML = `
        <div class="message-text">El canal astral ha sido abierto...</div>
    `;
    chatMessages.appendChild(systemMessage);
});
