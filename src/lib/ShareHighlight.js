const {EventEmitter} = require('events')
const request = require('request')
const fs = require('fs')

class ShareHighlight extends EventEmitter {
    static upload(title, file) {
        return new Promise((resolve, reject) => {
            request.post('https://api.streamable.com/upload', {
                formData: {
                    file: fs.createReadStream(file),
                    title: title
                }
            }, (err, response, body) => {
                if (err) {
                    reject(err)
                } else {
                    if (typeof body == 'object') {
                        resolve(body)
                    } else {
                        resolve(JSON.parse(body))
                    }
                }
            }) 
        })
    }
}

module.exports = ShareHighlight