const os = require('os')
const fs = require('fs')
const chokidar = require('chokidar')
const {EventEmitter} = require('events')
const pathResolver = require('path')
const Config = require('./Config')
const glob = require('glob')

class GameStateWatcher extends EventEmitter {
    constructor() {
        super()

        this.gameSeconds = 0;
        this.gameTimer = null;
        const self = this;

        let dirs = Config.getGamePaths()

        this.accountDir = Config.options.accountDir
        this.battleLobbyDir = pathResolver.join(...dirs.battleLobby)
    }

    time() {
        return ~~(this.gameSeconds / 60) + ":" + (this.gameSeconds % 60 < 10 ? "0" : "") + this.gameSeconds % 60;
    }

    reset() {
        this.gameSeconds = 0
        clearTimeout(this.gameTimer)
        this.gameTimer = null
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
            try {
                watcher.on('add', function(path) {
                    if (pathResolver.extname(path) == '.StormReplay') {
                        // We know the game has ended when the replay file is saved
                        self.emit('GAME_END', path)
                        self.reset()
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
            } catch (ex) {
                console.log('Could not watch account directory: ' + ex)
            }
            
        });
    }

    isGameRunning() {
        glob(this.battleLobbyDir + '/**/replay.tracker.events', (err, files) => {
            if (files.length > 0) {
                this.emit('GAME_IS_RUNNING')
            }
        })
    }

    setupBattleLobbyWatcher(battleLobbyDir) {

        this.log('Watching ' + battleLobbyDir)

        let watcher = chokidar.watch(battleLobbyDir, { persistent: true })
        let self = this
        try {
            watcher.on('ready', () => {
                watcher.on('add', function(path) {
                    self.log('File added: ' + path)
    
                    if (pathResolver.win32.basename(path) == 'replay.tracker.events') {
                        // When the recplay guts start to save, we know we're on the loading screen.
                        self.emit('GAME_START', path)
                    }
    
                    if (self.gameTimer === null) {
                        self.startTimer();
                    }
                })
                watcher.on('error', (err) => {
                    console.log(err)
                })
            })
        } catch (ex) {
            console.log('Could not watch battle lobby dir: ' + ex)
        }
    }

    watch() {
        this.setupReplayFolderWatcher(this.accountDir)
        this.setupBattleLobbyWatcher(this.battleLobbyDir)
        this.isGameRunning()

        return this
    }
}
 


module.exports = new GameStateWatcher