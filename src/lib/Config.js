
const app = require('electron').remote.app
const path = require('path')
const {EventEmitter} = require('events')
const fs = require('fs')
const os = require('os')

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
        let fullPath = path.join(app.getPath('videos'),'HotSTube')

        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath)
        }

        return path.join(fullPath, file)
    }

    defaults() {
        return {
            accountDir: path.join(...this.getGamePaths().account),
            resolution: "480p",
            sound: "off",
            recordAssists: true,
            recordPrekillSeconds: 6,
            recordMinimumSeconds: 10,
            fullVideoControls: false,
            showPatches: true
        }
    }

    save() {
        const path = this.filePath()

        fs.writeFileSync(path, JSON.stringify(this.options), 'utf8')
        this.emit('CONFIG_SAVED', this.options)
    }

    load() {
        this.options = this.defaults()
        const path = this.filePath()

        if (fs.existsSync(path)) {
            this.options = Object.assign(this.options, JSON.parse(fs.readFileSync(path, 'utf8')))

            if (!fs.existsSync(this.options.accountDir)) {
                this.options.accountDir = this.defaults().accountDir
            }

            this.emit('CONFIG_LOADED', this.options)
        }
    }
}

module.exports = new Config