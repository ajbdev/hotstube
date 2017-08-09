const os = require('os')
const fs = require('fs')
const chokidar = require('chokidar')
const {EventEmitter} = require('events')
const pathResolver = require('path')

class GameStateWatcher extends EventEmitter {
    constructor() {
        super()

        this.gameSeconds = 0;
        this.gameTimer = null;
        const self = this;

        if (os.platform() == 'win32') {
            this.accountDir = os.homedir() + ['','Documents','Heroes of the Storm','Accounts'].join(pathResolver.sep)
            this.battleLobbyDir = os.tmpdir() + ['','Heroes of the Storm'].join(pathResolver.sep)
        } else if (os.platform() == 'darwin') {
            this.accountDir = os.homedir() + ['','Library','Application Support','Blizzard','Heroes of the Storm','Accounts'].join(pathResolver.sep)
            this.battleLobbyDir = os.homedir() + ['','Library','Caches','TemporaryItems','Blizzard','Heroes of the Storm'].join(pathResolver.sep)
        } else {
            throw new Error(os.platform() + ' is unsupported')
        }
        
    }

    time() {
        return ~~(this.gameSeconds / 60) + ":" + (this.gameSeconds % 60 < 10 ? "0" : "") + this.gameSeconds % 60;
    }

    startTimer() {
        let self = this;

        this.gameTimer = setInterval(() => {
            self.gameSeconds++
        }, 1000)
    }

    log(msg) {
        let timeStamp = '';

        if (this.gameSeconds > 0) {
            timeStamp = `[${this.time()}] `
        }

        console.info(`${timeStamp}${msg}`)
    }

    setupReplayFolderWatcher(accountDir) {
        this.log('Watching ' + accountDir)

        let watcher = chokidar.watch(accountDir, { persistent: true })
        let self = this

        watcher.on('ready', () => {
            watcher.on('add', function(path) {
                if (pathResolver.extname(path) == '.StormReplay') {
                    // We know the game has ended when the replay file is saved
                    self.emit('GAME_END', path)
                } 

                if (pathResolver.extname(path) == '.StormSave') {
                    // At 90 seconds, the game creates a save file to use for rejoining purposes.
                    // This is important to capture because we start recording at the loading 
                    // screen, not the actual game start. This gives us a way to map the actual
                    // game time to the recorded video.  
                    self.emit('STORMSAVE_CREATED', path)
                }

                self.log('File added: ' + path)
                self.log('Extension: ' + pathResolver.extname(path))
            })
        });
    }

    setupBattleLobbyWatcher(battleLobbyDir) {

        this.log('Watching ' + battleLobbyDir)

        let watcher = chokidar.watch(battleLobbyDir, { persistent: true })
        let self = this
        watcher.on('ready', () => {
            watcher.on('add', function(path) {
                self.log('File added: ' + path)

                if (pathResolver.win32.basename(path) == 'replay.tracker.events') {
                    // When the replay guts start to save, we know we're on the loading screen.
                    self.emit('GAME_START')
                }

                if (self.gameTimer === null) {
                    self.startTimer();
                }
            })
        })
    }

    watch() {
        this.setupReplayFolderWatcher(this.accountDir);
        this.setupBattleLobbyWatcher(this.battleLobbyDir);

        return this
    }
}
 


module.exports = new GameStateWatcher