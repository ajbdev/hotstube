const pkg = require('../package.json')
const fs = require('fs')
const uploadArtifact = require('./upload-artifact')
const dist = require('../src/lib/Dist')

if (!fs.existsSync(dist.path())) {
    console.log('Could not find distributable: ' + dist.path())
} 

const versionsTxt = __dirname + '/../web/version.txt'
fs.writeFile(versionsTxt, pkg.version.toString(), (err) => {
    if (err) {
        console.log('Could not update version.txt: ' + err)
    }
    uploadArtifact(versionsTxt)
})

const copyTo = __dirname + '/../dist/' + dist.filename()

console.log('Copying ' + dist.path() + ' to ' + copyTo)

fs.writeFileSync(copyTo, fs.readFileSync(dist.path()))

console.log('Copied')

uploadArtifact(copyTo)