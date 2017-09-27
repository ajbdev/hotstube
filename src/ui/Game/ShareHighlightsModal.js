const React = require('react')
const HighlightReel = require('../../lib/HighlightReel')
const Streamable = require('../../lib/Streamable')
const pathResolver = require('path')
const GfycatApi = require('../../lib/GfycatApi')
const { shell } = require('electron')
const SharingCredentials = require('./SharingCredentials')

class ShareHighlightsModal extends React.Component { 
    constructor() {
        super()

        this.state = {
            captureCredentials: false,
            credentialsError: false
        }
    }
    componentDidMount() {
        return this.uploadStreamable()
    }
    uploadGfycat() {
        GfycatApi.upload(this.props.title, this.props.highlight).then((gfycatUrl) => {
            shell.openExternal(gfycatUrl)
            this.props.close()
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