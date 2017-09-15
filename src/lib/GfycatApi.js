
const request = require('request')
const qs = require('querystring')
const fs = require('fs')

class GfycatApi {
    constructor() {
        this.credentials = {
            client_id: '2_HM04l1',
            client_secret: 'JTWaazoplJWQoGd6GCWD6SHzXxRV-aPpfo7C6gqCqosYybwK346BYLtGJglpdV1C',
            grant_type: 'client_credentials'
        }

        this.apiUrl = 'https://api.gfycat.com/v1'

    }

    upload(caption, file) {
        return new Promise((resolve, reject) => {
            this.authenticate().then(() => {
                this.getUploadKey(caption).then((uploadKey) => {

                    this.uploadFile(uploadKey, file).then((result) => {
                        resolve(result)
                    })
                })
            })
        })
    }

    uploadFile(key, file) {
        return new Promise((resolve, reject) => {
            const opts = {
                url: 'https://filedrop.gfycat.com',
                method: 'POST',
                formData: {
                    key: key,
                    file: {
                        value:  fs.createReadStream(file),
                        options: {
                          filename: key
                        }
                    }
                }
            }

            request(opts, (err, response, body) => {
                console.log(response)
                if (err) {
                    reject(err)
                } else {
                    resolve('https://giant.gfycat.com/' + key + '.webm')
                }
            })
        })
    }

    getUploadKey(caption) {
        return new Promise((resolve, reject) => {
            this.request('POST','/gfycats', {
                data: {
                    title: caption,
                    tags: ['Heroes of the Storm','HotSTube']
                }
            }).then((result) => {
                resolve(result.gfyname)
            })
        })
    }

    authenticate() {
        return new Promise((resolve, reject) => {
            this.request('GET','/oauth/token', { qs: this.credentials }).then((result) => {
                if (result.access_token) {
                    this.token = result.access_token
                    resolve(result)
                } else {
                    reject(result)
                }
            })
        })
    }

    request(method, path, options) {
        const opts = Object.assign({
            url: this.apiUrl + path,
            method: method,
            headers: {}
        },options)

        if (this.token) {
            opts.headers.Authorization = 'Bearer ' + this.token
        }

        return new Promise((resolve, reject) => {
            request(opts, (err, response, body) => {
        
                console.log(response)
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

module.exports = new GfycatApi