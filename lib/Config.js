
const app = require('electron').remote.app
const path = require('path')
const fs = require('fs')

class Config {
    constructor() {
        this.load()
    }

    filePath() {
        return [app.getPath('appData'), 'HotSTube','config.json'].join(path.sep)
    }

    defaults() {
        return {
            resolution: "480p",
            sound: "off",
            recordAssists: true,
            recordPrekillSeconds: 6,
            recordMinimumSeconds: 10
        }
    }

    save() {
        const path = this.filePath()

        fs.writeFileSync(path, JSON.stringify(this.options), 'utf8')
    }

    load() {
        this.options = this.defaults()
        const path = this.filePath()

        if (fs.existsSync(path)) {
            this.options = Object.assign(this.options, JSON.parse(fs.readFileSync(path, 'utf8')))
        }
    }
}

module.exports = new Config