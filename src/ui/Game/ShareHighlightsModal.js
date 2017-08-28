const React = require('react')
const HighlightReel = require('../../lib/HighlightReel')
const ShareHighlights = require('../../lib/ShareHighlights')
const pathResolver = require('path')

class ShareHighlightsModal extends React.Component { 
    constructor() {
        super()

    }
    componentDidMount() {
        let path = HighlightReel.getSavePath(this.props.replay.accountId, this.props.replay.heroId, pathResolver.basename(this.props.replay.name,'.StormReplay'))
        
        const shareHighlights = new ShareHighlights(path)
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