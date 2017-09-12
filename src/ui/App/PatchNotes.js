const React = require('react')
const remote = require('electron').remote
const Svg = require('./Svg')
const { shell } = require('electron')

class Game extends React.Component {
    render() {
        if (!this.props.patch) {
            return null
        }

        const patch = this.props.patch

        const openBrowser = () => {
            shell.openExternal(patch.url)
        }

        return (
            <patch-notes>
                <h3>{patch.summary}</h3>
                <a className="external" onClick={openBrowser}>Open in browser
                    <Svg src="share-square.svg" />
                </a>
                <webview src={patch.url}></webview>
            </patch-notes>
        )
    }
}

module.exports = Game