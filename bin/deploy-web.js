const glob = require('glob')
const uploadArtifact = require('./upload-artifact')
const pathResolver = require('path')

glob('../web/*.*', (err, files) => {
    files.map((file) => {
        //uploadArtifact(file)
    })
})

glob('../web/game/*.*', (err, files) => {
    files.map((file) => {
        let path = 'game/' + pathResolver.basename(file)
        uploadArtifact(file, path)
    })
})