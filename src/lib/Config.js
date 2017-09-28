const app = require('electron').remote.app
const path = require('path')
const {EventEmitter} = require('events')
const fs = require('fs')
const os = require('os')
const glob = require('glob')

class Config extends EventEmitter {
    constructor() {
        super()

        this.load()
    }

    filePath() {
        return path.join(app.getPath('appData'), 'HotSTube','config.json')
    }

    getGamePaths() {
        if (os.platform() == 'win32') {
            return {
                account: [os.homedir(),'Documents','Heroes of the Storm','Accounts'],
                battleLobby: [os.tmpdir(),'Heroes of the Storm']
            }
        } else if (os.platform() == 'darwin') {
            return {
                account: [os.homedir(),'Library','Application Support','Blizzard','Heroes of the Storm','Accounts'],
                battleLobby: [os.homedir(),'Library','Caches','TemporaryItems','Blizzard','Heroes of the Storm']
            }
        } else {
            throw new Error(os.platform() + ' is unsupported')
        }
    }
    
    highlightsSavePath(file = '') {
        let fullPath = this.options.highlightDir

        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath)
        }

        return path.join(fullPath, file)
    }

    defaultHighlightPath() {
        return path.join(app.getPath('videos'),'HotSTube')
    }

    isAccountDirValid(dir = null) {
        if (!dir) {
            dir = this.options.accountDir
        }
        let accountDir = dir.split(path.sep)

        return glob.sync(accountDir.join('/') + '/*/*/Replays/Multiplayer').length > 0
    }

    defaults() {
        return {
            accountDir: path.join(...this.getGamePaths().account),
            resolution: "480p",
            sound: "off",
            highlightLifetimeDays: 7,
            enableRecording: true,
            deleteHighlights: true,
            recordAssists: true,
            deleteTemporaryVideos: true,
            recordPrekillSeconds: 9,
            recordMinimumSeconds: 15,
            highlightDir: this.defaultHighlightPath(),
            fullVideoControls: false,
            showPatches: true,
            welcomeScreen: true,
            streamableEmail: null,
            streamablePassword: null
        }
    }

    save() {
        const path = this.filePath()

        this.setWorkingPaths()
        fs.writeFileSync(path, JSON.stringify(this.options), 'utf8')
        this.emit('CONFIG_SAVED', this.options)
    }

    setWorkingPaths() {
        if (!fs.existsSync(this.options.accountDir)) {
            this.options.accountDir = this.defaults().accountDir
        }

        if (!fs.existsSync(this.options.highlightDir)) {
            this.options.highlightDir = this.defaults().highlightDir
        }
    }

    load() {
        this.options = this.defaults()
        const path = this.filePath()

        if (fs.existsSync(path)) {
            this.options = Object.assign(this.options, JSON.parse(fs.readFileSync(path, 'utf8')))

            this.setWorkingPaths()
            this.emit('CONFIG_LOADED', this.options)
        }
    }
}

module.exports = new Config