const package = require('../package.json')
const fs = require('fs')
const uploadArtifact = require('./upload-artifact')
let path = __dirname + '/../dist/HotSTube Setup ' + package.version + '.exe'

if (!fs.existsSync(path)) {
    console.log('Could not find distributable: ' + path)
} 

const versionsTxt = __dirname + '/../web/version.txt'
fs.writeFile(versionsTxt, package.version.toString(), (err) => {
    if (err) {
        console.log('Could not update version.txt: ' + err)
    }
    uploadArtifact(versionsTxt)
})

const copyTo = __dirname + '/../dist/HotSTube Setup.exe'

console.log('Copying ' + path + ' to ' + copyTo)

fs.writeFileSync(copyTo, fs.readFileSync(path))
uploadArtifact(copyTo)