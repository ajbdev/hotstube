const glob = require('glob')
const uploadArtifact = require('./upload-artifact')

glob('../web/*.*', (err, files) => {
    files.map((file) => {
        uploadArtifact(file)
    })
})