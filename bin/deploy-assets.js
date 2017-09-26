const glob = require('glob')
const uploadArtifact = require('./upload-artifact')
const pathResolver = require('path')

glob('../src/assets/**/*.*', (err, files) => {
    files.map((file) => {
        let path = 'game/' + file.substr(file.indexOf('assets'))

        uploadArtifact(file, path)
    })
})