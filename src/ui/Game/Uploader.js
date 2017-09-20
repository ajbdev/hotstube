const React = require('react')
const http = require('http')
const request = require('request')
const url = require('url')
const qs = require('querystring')
const Streamable = require('../../lib/Streamable')

class Uploader extends React.Component {
    constructor() {
        super()

        this.state = {
            uploaded: 0
        }
    }

    componentDidMount() {
        this.uploadAllHighlights()
    }

    async uploadAllHighlights() {
        const game = this.props.replay.game

        const self = this
        if (!game.highlights || Object.keys(game.highlights).length === 0) {
            return
        }

        const uploadFile = async (at) => {
            let file = game.highlights[at]
            
            const streamable = new Streamable(at, file)

            let url = await streamable.upload()
            this.setState({ uploaded: this.state.uploaded + 1 })

            game.highlights[at] = url

        }
        for (let i in Object.keys(game.highlights)) {
            await uploadFile(Object.keys(game.highlights)[i])
        }

        console.log('Uploaded all highlights')
        console.log(game.highlights)

        this.uploadGameData().then(() => {
            console.log('Game data uploaded')
        })
    }

    uploadGameData() {
        return new Promise((resolve, reject) => {
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
                    if (err) {
                        reject(err)
                    }
                    resolve('Finished')
                })
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