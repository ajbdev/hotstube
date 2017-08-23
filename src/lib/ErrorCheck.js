const path = require('path')
const fs = require('fs')
const ConfigOptions = require('./Config')
const os = require('os')

class ErrorCheck {
    constructor() {

        this.errors = []

        ConfigOptions.load();


        ['isPlatformSupported','canFindReplays'].map((check) => {
            if (!this[check]()) {
                this.errors.push(check)
            }
        })        
    }

    isPlatformSupported() {
        return os.platform() == 'win32' || os.platform() == 'darwin'
    }

    canFindReplays() {
        const dir = ConfigOptions.getGamePaths().account

        return fs.existsSync(path.join(...dir))
    }

}

module.exports = ErrorCheck