const {EventEmitter} = require('events')
const request = require('request')
const fs = require('fs')
const { shell, remote } = require('electron')
const Config = require('./Config')

class Streamable extends EventEmitter {
    constructor(title, file) {
        super()
        this.credentials = {
            email: '',
            pass: ''
        }

        Config.load()
        
        if (Config.options.streamableEmail && Config.options.streamablePassword) {
            this.credentials = {
                email: Config.options.streamableEmail,
                pass: atob(Config.options.streamablePassword)
            }
        }
    }
    request(path, method= 'GET', options = {}) {
        let url = 'https://api.streamable.com'
        return new Promise((resolve, reject) => {
            if (!this.credentials.email || !this.credentials.pass) {
                return reject('E-mail and password must be supplied')
            }

            request(Object.assign({
                url: url + '/upload',
                method: method,
                auth: {
                    user: this.credentials.email,
                    pass: this.credentials.pass,
                    sendImmediately: true
                }
            }, options), (err, response, body) => {
                console.log(response)
                if (response.statusCode == 401 || response.statusCode == 403) {
                    this.credentials.email = ''
                    this.credentials.pass = ''
                    reject('Invalid credentials')
                }

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
    upload(title, file) {
        return new Promise((resolve, reject) => {
            let self = this
            let headers = {'User-Agent': 'HotSTube v' + remote.app.getVersion()}
            this.request('/upload', 'POST', {
                headers: headers,
                formData: {
                    file: fs.createReadStream(file),
                    title: title
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

module.exports = new Streamable