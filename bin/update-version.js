const pkg = require('../package.json')
const fs = require('fs')
const uploadArtifact = require('./upload-artifact')
const versionsTxt = __dirname + '/../web/version.txt'

fs.writeFile(versionsTxt, pkg.version.toString(), (err) => {
    if (err) {
        console.log('Could not update version.txt: ' + err)
    }
    uploadArtifact(versionsTxt)
})

