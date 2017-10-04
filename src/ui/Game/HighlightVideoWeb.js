const Svg = require('../App/Svg')
const React = require('react')
const ReactDOM = require('react-dom')

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
    componentDidUpdate() {
        let hash = window.location.hash.replace('#', '')
        if (hash) {
            let node = ReactDOM.findDOMNode(this.refs[hash])

            if (node) {
                node.scrollIntoView()
            }
        }
    }

    getStreamableOembed() {
        fetch('https://api.streamable.com/oembed.json?url=' + this.props.url)
        .then((resp) => {
            return resp.json()
        }).then((result) => {
            this.setState({ embedHtml: result.html })
        })
    }

    render() {
        if (!this.state.embedHtml) {
            return null
        }

        return <div className="video-embed" 
                    ref={this.props.url}
                    dangerouslySetInnerHTML={{__html: this.state.embedHtml}}></div>
    }
}

module.exports = HighlightVideoWeb