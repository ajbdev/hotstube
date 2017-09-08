const pkg = require('../package.json')
const fs = require('fs')
const uploadArtifact = require('./upload-artifact')
const os = require('os')
const versionsTxt = __dirname + '/../web/' + os.platform() + '-version.txt'

fs.writeFile(versionsTxt, pkg.version.toString(), (err) => {
    if (err) {
        console.log('Could not update ' + versionsTxt + ': ' + err)
    }
    uploadArtifact(versionsTxt)
})

