// Definición de rangos disponibles en el sistema
const RANKS = {
    INICIADO: {
        id: 1,
        name: "Iniciado del Eco (Ayr'Lun)",
        symbol: "●",
        keyword: "Silencio",
        color: "#626262"
    },
    OIDOR: {
        id: 2,
        name: "Oidor de Sombras (Thyr'Saen)",
        symbol: "◑",
        keyword: "Susurro",
        color: "#824d99"
    },
    PORTADOR: {
        id: 3,
        name: "Portador del Velo (Naem'Lor)",
        symbol: "◐",
        keyword: "Velo",
        color: "#9b2d30"
    },
    SOMBRA: {
        id: 4,
        name: "Sombra Naciente (En'Kai)",
        symbol: "☽",
        keyword: "Reflejo",
        color: "#ab3c3c"
    },
    TEJEDOR: {
        id: 5,
        name: "Tejedor del Umbral (Zhur'Eth)",
        symbol: "◓",
        keyword: "Límite",
        color: "#c41e3a"
    },
    SACERDOTE: {
        id: 6,
        name: "Sacerdote Abismal (Vor'Mahar)",
        symbol: "○",
        keyword: "Vasto",
        color: "#ff0553"
    },
    LOCIAM: {
        id: 7,
        name: "Lociam del Abismo",
        symbol: "⟁",
        keyword: "Abismo",
        color: "#ff0000"
    }
};

// Obtener un array con todos los rangos
const RANKS_ARRAY = Object.values(RANKS);

// Clase para gestionar los rangos de usuarios
class RankManager {
    constructor() {
        this.users = new Map();
        this.adminKey = 'abismo_admin_key'; // Clave secreta para identificar al admin

        // Cargar rangos guardados
        this.loadSavedRanks();
    }

    // Verificar si un token es de administrador
    isAdmin(userToken) {
        return userToken === this.adminKey;
    }

    // Asignar rango a un usuario (solo admin)
    setUserRank(adminToken, userId, rankId) {
        // Verificar si es admin o propietario
        if (!this.isAdmin(adminToken) && localStorage.getItem('isOwner') !== 'true') {
            console.error("No tienes autorización para modificar rangos.");
            return null;
        }

        // Buscar el rango por ID
        const rank = RANKS_ARRAY.find(r => r.id === rankId);
        if (!rank) {
            console.error("Rango inválido: " + rankId);
            return null;
        }

        // Guardar el rango del usuario
        this.users.set(userId, rank);

        // Guardar en localStorage
        this.saveRanks();

        return rank;
    }

    // Obtener el rango de un usuario
    getUserRank(userId) {
        return this.users.get(userId) || RANKS.INICIADO;
    }

    // Guardar rangos en localStorage
    saveRanks() {
        const ranksData = {};
        this.users.forEach((rank, userId) => {
            ranksData[userId] = rank.id;
        });

        localStorage.setItem('userRanks', JSON.stringify(ranksData));
    }

    // Cargar rangos desde localStorage
    loadSavedRanks() {
        const savedRanks = localStorage.getItem('userRanks');
        if (savedRanks) {
            try {
                const ranksData = JSON.parse(savedRanks);
                Object.entries(ranksData).forEach(([userId, rankId]) => {
                    const rank = RANKS_ARRAY.find(r => r.id === rankId);
                    if (rank) {
                        this.users.set(userId, rank);
                    }
                });
            } catch (e) {
                console.error('Error al cargar rangos:', e);
            }
        }
    }
}

// Crear instancia global del gestor de rangos
const rankManager = new RankManager();

// Sistema de comandos para el admin
const rankCommands = {
    '/setrank': (adminToken, userId, rankId) => {
        return rankManager.setUserRank(adminToken, userId, parseInt(rankId));
    },
    '/viewrank': (userId) => {
        return rankManager.getUserRank(userId);
    }
};