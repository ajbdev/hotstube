const path = require('path')
const fs = require('fs')
const ConfigOptions = require('./Config')
const os = require('os')
const http = require('http')
const {app} = require('electron').remote
const semver = require('semver')

class ErrorCheck {
    constructor() {

        this.errors = []

        ConfigOptions.load()

        const checks = ['isPlatformSupported','canFindReplays']

        checks.map((check) => {
            let result = this[check]()
            if (result === false) {
                this.errors.push(check)
            }
        })        
    }

    isNewVersionAvailable(cb = null) {
        const self = this

        http.get({
            host: 'hotstube.com',
            path: '/' + os.platform() + '-version.txt'
        }, (response) => {
            let latestVersion = ''

            response.on('data', (d) => {
                latestVersion += d
            })

            response.on('end', () => {
                console.log('Latest version is: ' + latestVersion)
                if (semver.gt(latestVersion, app.getVersion())) {
                    
                    if (cb) { cb(true) }
                } else {
                    if (cb) { cb(false) }
                }
            })
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