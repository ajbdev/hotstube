const React = require('react')
const http = require('http')
const request = require('request')
const url = require('url')
const qs = require('querystring')
const Streamable = require('../../lib/Streamable')

class Uploader extends React.Component {
    constructor() {
        super()
    }

    componentDidMount() {
        this.uploadAllHighlights().then((numHighlights) => {
            console.log('Uploaded ' + numHighlights + ' highlights')
            this.uploadGameData()
        })
    }

    uploadAllHighlights() {
        const game = this.props.replay.game

        return new Promise((resolve, reject) => {
            if (!game.highlights || Object.keys(game.highlights).length === 0) {
                return resolve(0)
            }

            console.log(game.highlights)

            let uploaded = 0
            Object.keys(game.highlights).map((at) => {
                let file = game.highlights[at]

                const streamable = new Streamable(at, file)

                streamable.upload((url) => {
                    game.highlights[at] = url
                    console.log('Uploaded ' + url)
                    uploaded++

                    if (uploaded == Object.keys(game.highlights).length) {
                        return resolve(uploaded)
                    }
                })
            })
        })

    }

    uploadGameData() {
        this.getSignedS3Url().then((payload) => {
            const signedUrl = url.parse(payload)

            const data = JSON.stringify(this.props.replay.game)

            const headers = {
                'Content-Length': data.length
            }

            request.put({ 
                url: payload,
                headers: headers,
                body: data 
            }, (err,response,body) => {
                console.log('Uploaded game data')
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
        return (
            <uploader>
                <backdrop></backdrop>

                <modal>
                    <div className="progress progress-indeterminate">
                        <div className="progress-bar"></div>
                    </div>
                </modal>
            </uploader>
        )
    }
}

module.exports = Uploader