const {EventEmitter} = require('events')
const request = require('request')
const fs = require('fs')
const { shell } = require('electron')

class Streamable extends EventEmitter {
    constructor(title, file) {
        super()
        this.title = title
        this.file = file
        this.statusCheckTimer = null
    }
    request(path, method= 'GET', options = {}) {
        let url = 'https://api.streamable.com'
        return new Promise((resolve, reject) => {
            request(Object.assign({
                url: url + '/upload',
                method: method,
                auth: {
                    user: 'andybaird@gmail.com',
                    pass: 'hotstube',
                    sendImmediately: true
                }
            }, options), (err, response, body) => {
                console.log(response)
                if (err) {
                    reject(err)
                } else {
                    if (typeof body == 'object') {
                        resolve(body)
                    } else {
                        try {
                            resolve(JSON.parse(body))
                        } catch (ex) {
                            reject(ex)
                        }
                    }
                }
            }) 
        })
    }
    upload() {
        return new Promise((resolve, reject) => {
            let self = this
            this.request('/upload', 'POST', {
                formData: {
                    file: fs.createReadStream(this.file),
                    title: this.title
                }
            }).then((result) => {
                console.log(result)
                if (parseInt(result.status) >= 1) {
                    resolve('https://streamable.com/' + result.shortcode)
                } else {
                    reject(false)
                }
            }, (err) => {
                console.log(err)
                reject(err)
            })
        })        
    }
}

module.exports = Streamable