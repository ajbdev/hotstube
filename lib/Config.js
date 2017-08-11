
const app = require('electron').remote.app
const path = require('path')
const fs = require('fs')

class Config {
    constructor() {
        this.options = this.defaults()
    }

    filePath() {
        return [app.getPath('appData'), 'HotSTube','config.json'].join(path.sep)
    }

    defaults() {
        return {
            resolution: "480p",
            sound: "off"
        }
    }

    save() {
        const path = this.filePath()

        fs.writeFileSync(path, JSON.stringify(this.options), 'utf8')
    }

    load() {
        const path = this.filePath()

        if (fs.existsSync(path)) {
            this.options = JSON.parse(fs.readFileSync(path, 'utf8'))
        }
    }
}

module.exports = new Config