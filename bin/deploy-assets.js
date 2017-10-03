const glob = require('glob')
const uploadArtifact = require('./upload-artifact')
const pathResolver = require('path')

glob('../src/assets/**/*.*', (err, files) => {
    files.map((file) => {
        let path = 'games/' + file.substr(file.indexOf('assets'))

        uploadArtifact(file, path)
    })
})