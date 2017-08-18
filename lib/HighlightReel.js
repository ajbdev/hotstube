
const pathResolver = require('path')
const {EventEmitter} = require('events')
const ReplayAnalyzer = require('./ReplayAnalyzer')
const VideoClipMaker = require('./VideoClipMaker')
const app = require('electron').remote.app
const path = require('path')
const Config = require('./Config')
const fs = require('fs')

class HighlightReel extends EventEmitter {
    constructor(replay, video) {
        super()

        this.replayFile = replay
        this.analyzer = new ReplayAnalyzer(replay);
        this.video = video
        this.player = null

        this.analyzer.analyze()

        let self = this;

        // Determine who the player is
        // One of the dirs is the toon handle
        // There must be a better way to get this..
        replay.split(pathResolver.sep).map((dir) => {
            let player = self.analyzer.getPlayerByToonHandle(dir);

            if (player) {
                self.player = self.analyzer.game.players[player.m_workingSetSlotId]
                self.player.isReplayOwner = true
                console.log("Owning player is " + self.player.name)
            }
        })

        this.emit('Game analyzed', this.analyzer)
        console.log('Game analyzed')
    }

    getSavePath(file) {
        const path = Config.highlightsSavePath(file)

        if (!fs.existsSync(path)) {
            fs.mkdirSync(path)
        }
        
        return path
    }

    create() {
        
        Config.load()

        let fights = this.analyzer.fightsFor(this.player.name, Config.options.recordAssists)
        const clip = new VideoClipMaker(this.video)
        
        let highlights = 0;
        fights.map((fight) => {

            if (!fight.length) {
                return false;
            }

            const times = fight.map((death) => death.time )

            let min = times.reduce((a, b) => Math.min(a, b)); // First death of the fight
            let max = times.reduce((a, b) => Math.max(a, b)); // Last death of the fight

            // Start the clip a few seconds before the first death in this fight occurs
            if (min > Config.options.recordPrekillSeconds) {
                min -= Config.options.recordPrekillSeconds;
            }

            // Record the clip until the last death in the fight
            let duration = max - min;

            duration = duration < Config.options.recordMinimumSeconds ? Config.options.recordMinimumSeconds : duration + 3
            // Ensure clip is at least a minimum amount of seconds and extend anything at the minimum by 3 seconds
            // This is to ensure the clip records a little bit after the last death and is less jarring for the viewer
            
            let time = ~~(min / 60) + "." + (min % 60 < 10 ? "0" : "") + Math.floor(min % 60);
            console.log('Record at ' + time + ' for ' + duration + ' seconds')


            let replayName = pathResolver.basename(this.replayFile, '.StormReplay')
            let fileName = this.getSavePath(this.player.name + ' on ' + replayName + ' at ' + time);

            console.log(fileName)

            //clip.make(fileName, min, duration)
            highlights++
        })

        console.log(highlights + ' different highlights found and clipped')
    }
}

module.exports = HighlightReel