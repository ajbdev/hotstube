const heroprotocol = require('heroprotocol')

class Replay {

    constructor(file) {
        this.file = file;
        this.replay = {
            header: null,
            details: null,
            gameEvents: null,
            trackerEvents: null,
            messageEvents: null,
            initdata: null
        }
    }

    header() {
        if (this.replay.header === null) {
            this.replay.header = heroprotocol.get(heroprotocol.HEADER, this.file)
        }
        return this.replay.header
    }

    initdata() {
        if (this.replay.initdata === null) {
            this.replay.initdata = heroprotocol.get(heroprotocol.INITDATA, this.file)
        }
        return this.replay.initdata
    }

    gameEvents() {
        if (this.replay.gameEvents === null) {
            this.replay.gameEvents = heroprotocol.get(heroprotocol.GAME_EVENTS, this.file)
        }
        return this.replay.gameEvents
    }

    messageEvents() {
        if (this.replay.messageEvents === null) {
            this.replay.messageEvents = heroprotocol.get(heroprotocol.MESSAGE_EVENTS, this.file)
        }
        return this.replay.messageEvents
    }

    trackerEvents() {
        if (this.replay.trackerEvents === null) {
            this.replay.trackerEvents = heroprotocol.get(heroprotocol.TRACKER_EVENTS, this.file)
        }
        return this.replay.trackerEvents
    }

    details() {
        if (this.replay.details === null) {
            this.replay.details = heroprotocol.get(heroprotocol.DETAILS, this.file)
        }
        return this.replay.details;
    }
}

module.exports = Replay