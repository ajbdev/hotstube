const path = require('path')
const fs = require('fs')
const os = require('os')
const Config = require('./Config')
const {EventEmitter} = require('events')
const GameStateWatcher = require('./GameStateWatcher')
const ReplayAnalyzer = require('./ReplayAnalyzer')
const HighlightReel = require('./HighlightReel')

class GameIndex extends EventEmitter {
    constructor() {
        super()
        this.index = []
        this.analyzeQueue = []
        this.isAnalyzing = false
        this.queueTimer = null
    }

    load() {
        this.index = this.recentReplays()

        this.emit('INDEX_LOADED', this.index)
    }

    recentReplays() {
        const replayRootDir = Config.options.accountDir.split(path.sep)

        if (os.platform() == 'darwin' && replayRootDir[0].length == 0) {
            replayRootDir[0] = '/'
        }
        
        const isDirectory = source => fs.existsSync(source) && fs.lstatSync(source).isDirectory()

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
                const heroDir = path.join(...innerAccountDir.concat([d,'Replays','Multiplayer']))
                if (isDirectory(heroDir)) {
                    const heroId = parseInt(d.match(/\d+\-Hero\-\d+\-(\d+)/)[1])

                    const replayFiles = fs.readdirSync(heroDir)

                    replays = replays.concat(replayFiles.map((file) => {
                        const replayPath = path.join(heroDir, file)

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