const heroprotocol = require('./HeroProtocol')

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
        this.protocolDir = ''

    }

    get(section, file) {
        if (this.protocolDir) {
            heroprotocol.protocolDir = this.protocolDir
        }
        
        return heroprotocol.get(section, file)
    }

    header() {
        if (this.replay.header === null) {
            this.replay.header = this.get(heroprotocol.HEADER, this.file)
        }
        return this.replay.header
    }

    initdata() {
        if (this.replay.initdata === null) {
            this.replay.initdata = this.get(heroprotocol.INITDATA, this.file)
        }
        return this.replay.initdata
    }

    gameEvents() {
        if (this.replay.gameEvents === null) {
            this.replay.gameEvents = this.get(heroprotocol.GAME_EVENTS, this.file)
        }
        return this.replay.gameEvents
    }

    messageEvents() {
        if (this.replay.messageEvents === null) {
            this.replay.messageEvents = this.get(heroprotocol.MESSAGE_EVENTS, this.file)
        }
        return this.replay.messageEvents
    }

    trackerEvents() {
        if (this.replay.trackerEvents === null) {
            this.replay.trackerEvents = this.get(heroprotocol.TRACKER_EVENTS, this.file)
        }
        return this.replay.trackerEvents
    }

    details() {
        if (this.replay.details === null) {
            this.replay.details = this.get(heroprotocol.DETAILS, this.file)
        }
        return this.replay.details;
    }
}

module.exports = Replay