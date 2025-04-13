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

class RankManager {
    constructor() {
        this.users = new Map();
        this.adminKey = 'abismo_admin_key'; // Clave secreta para identificar al admin
    }

    isAdmin(userToken) {
        return userToken === this.adminKey;
    }

    setUserRank(adminToken, userId, rankId) {
        if (!this.isAdmin(adminToken)) {
            throw new Error("No tienes autorización para modificar rangos.");
        }

        const rank = Object.values(RANKS).find(r => r.id === rankId);
        if (!rank) {
            throw new Error("Rango inválido");
        }

        this.users.set(userId, rank);
        return rank;
    }

    getUserRank(userId) {
        return this.users.get(userId) || RANKS.INICIADO;
    }
}

// Sistema de comandos para el admin
const rankCommands = {
    '/setrank': (adminToken, userId, rankId) => {
        return rankManager.setUserRank(adminToken, userId, parseInt(rankId));
    },
    '/viewrank': (userId) => {
        return rankManager.getUserRank(userId);
    }
};