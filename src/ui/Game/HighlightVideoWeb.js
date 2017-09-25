const Svg = require('../App/Svg')
const React = require('react')

class HighlightVideoWeb extends React.Component { 
    constructor() {
        super()

        this.state = { embedHtml: null }
    }

    componentDidMount() {
        if (this.props.url.indexOf('streamable') > -1) {
            return this.getStreamableOembed()
        }
    }

    getStreamableOembed() {
        fetch('https://api.streamable.com/oembed.json?url=' + this.props.url)
        .then((resp) => {
            return resp.json()
        }).then((result) => {
            console.log(result)
            this.setState({ embedHtml: result.html })
        })
    }

    render() {
        if (!this.state.embedHtml) {
            return null
        }

        return <div className="video-embed" dangerouslySetInnerHTML={{__html: this.state.embedHtml}}></div>
    }
}

module.exports = HighlightVideoWeb