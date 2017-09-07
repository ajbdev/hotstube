const pkg = require('../package.json')
const fs = require('fs')
const uploadArtifact = require('./upload-artifact')
const dist = require('../src/lib/Dist')
const updateVersion = require('./update-version')

if (!fs.existsSync(dist.path())) {
    console.log('Could not find distributable: ' + dist.path())
} 

const copyTo = __dirname + '/../dist/' + dist.filename()

console.log('Copying ' + dist.path() + ' to ' + copyTo)

fs.writeFileSync(copyTo, fs.readFileSync(dist.path()))

console.log('Copied')

uploadArtifact(copyTo)