
const app = require('electron').remote.app
const path = require('path')
const {EventEmitter} = require('events')
const fs = require('fs')

class Config extends EventEmitter {
    constructor() {
        super()

        this.load()
    }

    filePath() {
        return path.join(app.getPath('appData'), 'HotSTube','config.json')
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
            this.emit('CONFIG_LOADED', this.options)
        }
    }
}

module.exports = new Config