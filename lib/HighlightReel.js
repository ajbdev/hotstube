
const pathResolver = require('path')
const {EventEmitter} = require('events')
const ReplayAnalyzer = require('../lib/ReplayAnalyzer')
const VideoClipMaker = require('../lib/VideoClipMaker')

class HighlightReel extends EventEmitter {
    constructor(replay, video) {
        super()

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

    create() {
        let fights = this.analyzer.fightsFor(this.player.name)
        const clip = new VideoClipMaker(this.video)
        
        let highlights = 0;
        fights.map((fight) => {

            if (!fight.length) {
                return false;
            }

            const times = fight.map((death) => death.time )

            let min = times.reduce((a, b) => Math.min(a, b)); // First death of the fight
            let max = times.reduce((a, b) => Math.max(a, b)); // Last death of the fight

            // Start the clip 6 seconds before the first death in this fight occurs
            if (min > 6) {
                min -= 6;
            }

            // Record the clip until the last death in the fight
            let duration = max - min;

            duration = duration < 10 ? 10 : duration + 3
            // Make the minimum duration 10 seconds, and extend any clip already at 10 by 3 more seconds
            // This is to ensure the clip records a little bit after the last death and is less jarring for the viewer
            
            let time = ~~(min / 60) + "" + (min % 60 < 10 ? "0" : "") + Math.floor(min % 60);
            console.log('Record at ' + min + ' for ' + duration)
            let fileName = 'replay-' + time;

            clip.make(fileName, min, duration)
            highlights++
        })

        console.log(highlights + ' different highlights found and clipped')
    }
}

module.exports = HighlightReel