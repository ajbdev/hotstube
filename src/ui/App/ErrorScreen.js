const React = require('react')
const remote = require('electron').remote
const Svg = require('./Svg')
const os = require('os')
const { shell } = require('electron')

class ErrorScreen extends React.Component {
    constructor() {
        super()

        this.error.bind(this)
    }

    error(name) {
        return this.props.errors.indexOf(name) > -1
    }

    openBetaDownloadLink() {
        shell.openExternal('http://hotstube.com/download.html')
    }

    render() {
        return (
            <game className="corrupt">
                <Svg src="exclamation-triangle.svg" className="subdued" />
                <h1>HotSTube has a problem</h1>
                
                <br />
                <div className="reasons">
                    <ol>
                        {this.error('isNewBetaAvailable') ? <li>There is a new beta available. Please <a onClick={this.openBetaDownloadLink}>download it</a> to continue using HotSTube.</li> : null}
                        {this.error('isPlatformSupported') ? <li>Your platform ({os.platform()}) is not supported by HotSTube :( </li> : null}
                        {this.error('canFindReplays') ? <li>HotSTube can't find your replay directory. <a onClick={() => this.props.configWindow('directories')}>Set the folder manually</a> to fix this problem. </li> : null}
                    </ol>
                </div>
            </game>
        )
    }
}

module.exports = ErrorScreen