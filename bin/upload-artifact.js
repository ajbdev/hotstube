const aws = require('aws-sdk')
const mime = require('mime-types')
const s3 = new aws.S3()
const fs = require('fs')
const pathResolver = require('path')


module.exports = (path) => {
    const fileName = pathResolver.basename(path)

    console.log('Uploading ' + path)

    const stat = fs.statSync(path)

    s3.putObject({
        Bucket: 'hotstube.com',
        ACL: "public-read", 
        ContentType: mime.lookup(fileName),
        Key: fileName,
        Body: fs.createReadStream(path)
    }, function(err, data) {
        if (err) {
            console.log(err)
        } else {
            console.log('Uploaded hotstube.com/' + fileName)
        }        
    })        
}