const React = require('react')
const HighlightReel = require('../../lib/HighlightReel')
const Streamable = require('../../lib/Streamable')
const pathResolver = require('path')
const GfycatApi = require('../../lib/GfycatApi')
const { shell } = require('electron')

class ShareHighlightsModal extends React.Component { 
    constructor() {
        super()
    }
    componentDidMount() {
        if (this.props.streamable) {
            return this.uploadStreamable()
        }

        this.uploadGfycat()
    }
    uploadGfycat() {
        GfycatApi.upload(this.props.title, this.props.highlight).then((gfycatUrl) => {
            shell.openExternal(gfycatUrl)
            this.props.close()
        })
    }
    uploadStreamable() {
        const streamable = new Streamable(this.props.title, this.props.highlight)
        
        let self = this
        streamable.upload((url) => {
            if (url) {
                shell.openExternal(url)
            }
            self.props.close() 
        })
    }

    render() {
        return (
            <share-highlights-modal>
                <backdrop></backdrop>

                <modal>
                    <div className="progress progress-indeterminate">
                        <div className="progress-bar"></div>
                    </div>
                </modal>
            </share-highlights-modal>
        )
    }
}

module.exports = ShareHighlightsModal