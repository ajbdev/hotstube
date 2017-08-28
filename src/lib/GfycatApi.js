
const request = require('request')
const qs = require('querystring')

class GfycatApi {
    constructor() {
        this.credentials = {
            client_id: '2_HM04l1',
            client_secret: 'JTWaazoplJWQoGd6GCWD6SHzXxRV-aPpfo7C6gqCqosYybwK346BYLtGJglpdV1C',
            grant_type: 'client_credentials'
        }

        this.apiUrl = 'https://api.gfycat.com/v1'

        this.authenticate()
            .then(this.createAlbum.bind(this))
    }

    createAlbum() {
        return new Promise((resolve, reject) => {
            this.request('POST','/me/albums', {
                json: {
                    title: 'My Album',
                    description: 'This is my album'
                }
            }).then((result) => {
                console.log(result)
            })
        })
    }

    authenticate() {
        return new Promise((resolve, reject) => {
            this.request('GET','/oauth/token?', { qs: this.credentials }).then((result) => {
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
            headers: {
                'accept': 'application/json'
            }
        },options)

        if (this.token) {
            opts.headers.Authorization = 'Bearer ' + this.token
        }

        console.log(opts)

        return new Promise((resolve, reject) => {
            request(opts, (err, response, body) => {
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

module.exports = GfycatApi