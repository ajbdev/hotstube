const path = require('path')
const fs = require('fs')
const Config = require('./Config')
const {EventEmitter} = require('events')
const GameStateWatcher = require('./GameStateWatcher')
const ReplayAnalyzer = require('./ReplayAnalyzer')

class GameIndex extends EventEmitter {
    constructor() {
        super()
        this.index = []
        this.analyzeQueue = []
        this.isAnalyzing = false
        this.queueTimer = null
    }

    load() {
        this.buildFromArtifacts()

        this.emit('INDEX_LOADED', this.index)
    }

    buildFromArtifacts() {
        const videosDir = Config.highlightsSavePath()

        const replays = this.recentReplays()

        this.index = replays.map((replay) => {
            let videoHighlightPath = path.join(videosDir,path.basename(replay.name))

            let video = fs.existsSync(videoHighlightPath + '.webm')
            let highlightFolder = fs.existsSync(videoHighlightPath)

            if (video) {
                replay.video = video
                replay.highlights = highlightFolder
            }

            return replay
        })
    }

    recentReplays() {
        const replayRootDir = GameStateWatcher.directories().account
        const isDirectory = source => fs.lstatSync(source).isDirectory()

        let replays = []

        let accounts, accountIds

        try {
            accounts = fs.readdirSync(path.join(...replayRootDir))
            accountIds = accounts.filter((account) => isDirectory(path.join(...replayRootDir.concat([account]))))
        } catch(ex) {
            console.log('Account directories could not be loaded: '  + ex)
            return replays
        }
        
        accountIds.map((accountId) => {
            let innerAccountDir = replayRootDir.concat(accountId)            
            let heroDirs = fs.readdirSync(path.join(...innerAccountDir))
                                .filter((f) => isDirectory(path.join(...innerAccountDir.concat(f))))

            heroDirs.map((d) => {
                let heroDir = path.join(...innerAccountDir.concat([d,'Replays','Multiplayer']))
                if (isDirectory(heroDir)) {
                    let heroId = parseInt(d.match(/\d+\-Hero\-\d+\-(\d+)/)[1])

                    let replayFiles = fs.readdirSync(heroDir)

                    replays = replays.concat(replayFiles.map((file) => {
                        let replayPath = path.join(heroDir, file)
                        return {
                            name: replayPath,
                            accountId: parseInt(accountId),
                            heroId: heroId,
                            time: fs.statSync(replayPath).mtime.getTime()
                        }
                    }))
                }
            })
        })
    
        return replays.sort((a,b) => b.time - a.time)
    }

}

module.exports = new GameIndex