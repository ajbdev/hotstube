class Players {
    constructor(players) {
        this.players = players
    }

    find(id) {
        return this.players.filter((p) => p.playerId == id)[0]
    }
}

module.exports = Players