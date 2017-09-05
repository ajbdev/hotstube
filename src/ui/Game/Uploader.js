const React = require('react')
const http = require('http')
const request = require('request')
const url = require('url')
const qs = require('querystring')

class Uploader extends React.Component {
    constructor() {
        super()
    }

    componentDidMount() {
        this.getSignedS3Url().then((payload) => {
            const signedUrl = url.parse(payload)

            const data = Object.assign(
                { file: JSON.stringify(this.props.replay) },
                qs.parse(signedUrl.query)
            )

            const href = signedUrl.protocol + '//' + signedUrl.hostname + signedUrl.pathname
            console.log('Uploading file to ' + href)

            request.put(href, { formData: data }, (err,response,body) => {
                console.log(err, response, body)
            })
        })
    }

    getSignedS3Url() {
        return new Promise((resolve, reject) => {
            request({
                url: 'https://2pmey6kuv7.execute-api.us-east-1.amazonaws.com/prod/HotSTubeS3SignedUrl',
                method: 'GET',
            }, (err, response, body) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(JSON.parse(body).url)
                }
            })
        })
    }
    
    render() {
        return null
    }
}

module.exports = Uploader