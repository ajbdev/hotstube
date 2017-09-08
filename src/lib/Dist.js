const pkg = require('../../package.json')
const os = require('os')
const path = require('path')

class Dist {
    static filename(version = '') {
        if (os.platform() == 'win32') {
            if (version) {
                version = ' ' + version
            }
            return 'HotSTube Setup' + version + '.exe'
        } else if (os.platform() == 'darwin') {
            if (version) {
                version = '-' + version
            }
            return 'HotSTube' + version + '.dmg'
        }
    }

    static path() {
        return path.resolve('../dist/' + this.filename(pkg.version))
    }
}

module.exports = Dist