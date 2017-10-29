const React = require('react')
const HighlightReel = require('../../lib/HighlightReel')
const Streamable = require('../../lib/Streamable')
const pathResolver = require('path')
const GfycatApi = require('../../lib/GfycatApi')
const { shell } = require('electron')
const SharingCredentials = require('./SharingCredentials')
const GameHash = require('../../lib/GameHash')
const request = require('request')
const env = require('../../env')
const analytics = require('../../lib/GoogleAnalytics')

class ShareHighlightsModal extends React.Component { 
    constructor() {
        super()

        this.state = {
            captureCredentials: false,
            credentialsError: false
        }
    }
    componentDidMount() {
        analytics.event('Share','highlight')

        return this.uploadStreamable()
    }
    uploadGfycat() {
        GfycatApi.upload(this.props.title, this.props.highlight).then((gfycatUrl) => {
            shell.openExternal(gfycatUrl)
            this.props.close()
        })
    }
    
    checkIsGameAndHighlightUploaded() { 
        return new Promise((resolve, reject) => {
            let hash = GameHash.hash(this.props.game)
            request({
                url: `https://s3.amazonaws.com/hotstube/${hash}.json`,
                method: 'GET',
            }, (err, response, body) => {
                if (response.statusCode == 404) {
                    reject('Not uploaded')
                } else if (response.statusCode == 200) {
                    let game = JSON.parse(body)

                    if (game.highlights) {
                        let video = game.highlights[this.props.at]
                        if (video) {
                            resolve(env.url + '?id=' + hash + '#' + video)
                        }
                    }
                    reject('Video not found')
                }
            })
        })   
    }

    uploadStreamable() {
        let self = this

        if (!Streamable.credentials.email || !Streamable.credentials.pass) {
            this.setState({
                captureCredentials: true
            })
            return
        }

        this.checkIsGameAndHighlightUploaded().then((anchoredHighlightUrl) => {
            console.log(anchoredHighlightUrl)
            shell.openExternal(anchoredHighlightUrl)
            this.props.close()
        }, (err) => { 
            Streamable.upload(this.props.title, this.props.highlight).then((url) => {
                if (url) {
                    shell.openExternal(url)
                }
                self.props.close() 
            }).catch((err) => {
                if (err == 'Invalid credentials') {
                    this.setState({ captureCredentials: true, credentialsError: true })
                } else {
                    self.props.close() 
                }
            })
        })
    }
    
    closeCaptureCredentials() {
        this.setState({ captureCredentials: false }, () => {
            if (Streamable.credentials.email && Streamable.credentials.pass) {
                this.uploadStreamable()
            }
        })
    }
    render() {
        return (
            <share-highlights-modal>
                <backdrop></backdrop>

                {this.state.captureCredentials ? 
                    <SharingCredentials cancel={this.props.close} close={this.closeCaptureCredentials.bind(this)} credentialsError={this.state.credentialsError} /> :
                    <modal>
                        <div className="progress progress-indeterminate">
                            <div className="progress-bar"></div>
                        </div>
                    </modal>
                }
            </share-highlights-modal>
        )
    }
}

module.exports = ShareHighlightsModal