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

            const data = JSON.stringify(this.props.replay.game)

            const headers = {
                'Content-Length': data.length
            }

            console.log(data)

            request.put({ 
                url: payload,
                headers: headers,
                body: data 
            }, (err,response,body) => {
                console.log(err, response, body)
            })
        })
    }

    getSignedS3Url() {
        const game = this.props.replay.game

        const payload = {
            build: game.build,
            map: game.map,
            utcTimestamp: game.utcTimestamp,
            players: game.players.map((p) => p.id + ':' + p.teamId).sort()
        }

        return new Promise((resolve, reject) => {
            request({
                url: 'https://2pmey6kuv7.execute-api.us-east-1.amazonaws.com/prod/HotSTubeS3SignedUrl',
                body: qs.stringify(payload),
                method: 'POST',
            }, (err, response, body) => {
                if (err) {
                    reject(err)
                } else {
                    console.log(body)
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