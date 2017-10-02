const glob = require('glob')
const uploadArtifact = require('./upload-artifact')
const pathResolver = require('path')



glob(__dirname + '/../web/*.*', (err, files) => {
    files.map((file) => {
        //uploadArtifact(file)
    })
})

glob(__dirname + '/../web/games/*.*', (err, files) => {
    files.map((file) => {
        let path = 'games/' + pathResolver.basename(file)
        uploadArtifact(file, path)
    })
})