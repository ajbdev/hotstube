const os = require('os')
const fs = require('fs')
const chokidar = require('chokidar')
const {EventEmitter} = require('events')

class GameStateWatcher extends EventEmitter {
    constructor() {
        super()

        this.accountDir = os.homedir() + '\\Documents\\Heroes of the Storm\\Accounts\\'
        this.battleLobbyDir = os.tmpdir() + "\\Heroes of the Storm\\"
    }

    setupReplayFolderWatcher(accountDir) {
        console.info('Watching ' + accountDir)

        let watcher = chokidar.watch(accountDir, { persistent: true })
        let self = this

        watcher.on('ready', () => {
            watcher.on('add', function(path) {
                // Game is completed and the replay file has been copied to dir
                console.info('Game complete!')
                self.emit('GAME_END')
            })
        });
    }

    setupBattleLobbyWatcher(battleLobbyDir) {

        console.info('Watching ' + battleLobbyDir)

        let watcher = chokidar.watch(battleLobbyDir, { persistent: true })
        let self = this
        watcher.on('add', function(path) {
            // Game is completed and the replay file has been copied to dir
            console.info('Game has started')

            self.emit('GAME_START')

            console.log(path)
        })
    }

    watch() {
        this.setupReplayFolderWatcher(this.accountDir);
        this.setupBattleLobbyWatcher(this.battleLobbyDir);

        return this
    }
}
 


module.exports = GameStateWatcher