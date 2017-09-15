
const pathResolver = require('path')
const {EventEmitter} = require('events')
const ReplayAnalyzer = require('./ReplayAnalyzer')
const VideoClipMaker = require('./VideoClipMaker')
const GameTimeline = require('./GameTimeline')
const app = require('electron').remote.app
const path = require('path')
const Config = require('./Config')
const fs = require('fs')
const glob = require('glob')

class HighlightReel extends EventEmitter {
    constructor(replay, video) {
        super()

        this.replayFile = replay
        this.analyzer = new ReplayAnalyzer(replay);
        this.video = video
        this.player = null

        this.analyzer.analyze()

        this.gameTimeline = new GameTimeline(this.analyzer.game)

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
    
    static hasHighlightsCreated(accountId, heroId, replayName) {
        const path = this.getSavePath(accountId, heroId, replayName)

        return glob.sync(pathResolver.join(path,"*.webm")).length > 0
    }

    static getSavePath(accountId, heroId, replayName) {
        let path = Config.highlightsSavePath(accountId + '-' + heroId)

        if (!fs.existsSync(path)) {
            fs.mkdirSync(path)
        }

        path = pathResolver.join(path, replayName)

        if (!fs.existsSync(path)) {
            fs.mkdirSync(path)
        }
        
        return path
    }

    create(accountId, heroId) {
        
        Config.load()

        let fights = this.gameTimeline.fightsFor(this.player.name, Config.options.recordAssists)
        if (!fs.existsSync(this.video)) {
            console.log('Not yet created')
            return
        }
        const clip = new VideoClipMaker(this.video)
        
        let highlights = {}
        
        fights.map((fight) => {

            if (!fight.length) {
                return false;
            }
            const times = fight.map((death) => death.time )

            let min = times.reduce((a, b) => Math.min(a, b)); // First death of the fight

            let deathTime = min
            let max = times.reduce((a, b) => Math.max(a, b)); // Last death of the fight

            // Start the clip a few seconds before the first death in this fight occurs
            if (min > Config.options.recordPrekillSeconds) {
                min -= Config.options.recordPrekillSeconds
            }

            // Calculate the time slide factor between the video and the replay game time
            let slideFactor = (at) => {
                //(-0.016*min)+8.2
                return at + ((-0.016*at)+8.2)
            }
            // Record the clip until the last death in the fight
            let duration = slideFactor(max) - slideFactor(min);

            duration = duration < Config.options.recordMinimumSeconds ? Config.options.recordMinimumSeconds : duration + 3
            // Ensure clip is at least a minimum amount of seconds and extend anything at the minimum by 3 seconds
            // This is to ensure the clip records a little bit after the last death and is less jarring for the viewer
            
            let time = ~~(deathTime / 60) + "." + (deathTime % 60 < 10 ? "0" : "") + Math.floor(deathTime % 60);

            let replayName = pathResolver.basename(this.replayFile, '.StormReplay')
            
            const path = this.constructor.getSavePath(accountId, heroId, replayName)
            let fileName = pathResolver.join(path, time)
                       

            if (!fs.existsSync(fileName)) {
                clip.make(fileName, slideFactor(min), duration)
            }            
            highlights[time] = fileName
        })

        console.log(Object.keys(highlights).length + ' different highlights found and clipped')
        
        if (Config.options.deleteTemporaryVideos) {
            fs.unlink(this.video, (err) => {
                if (err) {
                    console.log('Could not delete video: ' + err)
                } else {
                    console.log('Deleted ' + this.video)
                }
            })
        }

        return highlights
    }
}

module.exports = HighlightReel
