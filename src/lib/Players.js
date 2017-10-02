class Players {
    constructor(players) {
        this.players = players
    }

    replayOwner() {
        return this.players.filter((p) => p.isReplayOwner)[0]
    }

    find(id) {
        return this.players.filter((p) => p.playerId == id)[0]
    }
}

module.exports = Players