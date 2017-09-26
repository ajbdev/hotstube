const React = require('react')
const http = require('http')
const request = require('request')
const url = require('url')
const qs = require('querystring')
const Streamable = require('../../lib/Streamable')
const env = require('../../env')
const { shell } = require('electron')
const GameHash = require('../../lib/GameHash')

class Uploader extends React.Component {
    constructor() {
        super()

        this.state = {
            uploaded: 0,
            message: ''
        }
    }

    componentDidMount() {
        //this.uploadAllHighlights()

        this.isUploaded()
    }

    isUploaded() {

        let hash = GameHash.hash(this.props.replay.game)
        request({
            url: `https://s3.amazonaws.com/hotstube/${hash}}.json`,
            method: 'GET',
        }, (err, response, body) => {
            if (response.statusCode == 404) {
                this.uploadAllHighlights()
            } else if (response.statusCode == 200) {
                shell.openExternal(env.url + '?game_id=' + hash)
                this.props.close()
            }
        })
    }

    async uploadAllHighlights() {
        const game = this.props.replay.game

        const self = this

        const uploadFile = async (at) => {
            let file = game.highlights[at]
            
            this.setState({
                message: 'Uploading highlights (' + this.state.uploaded + '/' + Object.keys(game.highlights).length + ')'
            })
            const streamable = new Streamable(at, file)

            let url = await streamable.upload()
            this.setState({ 
                uploaded: this.state.uploaded + 1
            })
            
            game.highlights[at] = url

        }
        
        if (game.highlights && Object.keys(game.highlights).length > 0) {
            for (let i in Object.keys(game.highlights)) {
                await uploadFile(Object.keys(game.highlights)[i])
            }
            console.log('Uploaded all highlights')
            console.log(game.highlights)
        }


        this.uploadGameData().then(() => {
            console.log('Game data uploaded')
            this.props.close()
            shell.openExternal(env.url + '?game_id=' + GameHash.hash(game))

        })
    }

    uploadGameData() {
        return new Promise((resolve, reject) => {
            this.setState({ message: 'Uploading game data'})
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
                    <div className="progress-caption">{this.state.message}</div>
                    <div className="progress progress-indeterminate">
                        <div className="progress-bar"></div>
                    </div>
                </modal>
            </uploader>
        )
    }
}

module.exports = Uploader