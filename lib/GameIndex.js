const path = require('path')
const fs = require('fs')
const Config = require('./Config')
const GameStateWatcher = require('./GameStateWatcher')

class GameIndex {
    constructor() {
        this.index = []
    }

    load() {

    }

    buildFromArtifacts() {
        const videosDir = Config.highlightsSavePath()

        const replays = this.recentReplays()

        replays.map((replay) => {
            let videoHighlightPath = path.join(videosDir,path.basename(replay))

            let video = fs.existsSync(videoHighlightPath + '.webm')
            let highlightFolder = fs.existsSync(videoHighlightPath)

            if (video) {
                console.log('Yes video exists')
            }

            if (highlightFolder) {
                console.log('Yes highlight folder exists')
            }
        })

    }

    recentReplays() {
        const replayRootDir = GameStateWatcher.directories().account
        const isDirectory = source => fs.lstatSync(source).isDirectory()

        let replays = []

        let accounts = fs.readdirSync(path.join(...replayRootDir))
        let accountIds = accounts.filter((account) => isDirectory(path.join(...replayRootDir.concat([account]))))

        
        accountIds.map((accountId) => {
            let innerAccountDir = replayRootDir.concat(accountId)

            
            let heroDirs = fs.readdirSync(path.join(...innerAccountDir))
                                .filter((f) => isDirectory(path.join(...innerAccountDir.concat(f))))

            
            heroDirs.map((d) => {
                let heroDir = path.join(...innerAccountDir.concat([d,'Replays','Multiplayer']))
                if (isDirectory(heroDir)) {
                    let replayFiles = fs.readdirSync(heroDir)

                    replays = replays.concat(replayFiles.map((file) => {
                        let replayPath = path.join(heroDir, file)
                        return {
                            name: replayPath,
                            time: fs.statSync(replayPath).mtime.getTime()
                        }
                    }))
                }
            })
        })
    
        return replays.sort((a,b) => b.time - a.time)
                            .map((r) => r.name)
    }

}

module.exports = GameIndex