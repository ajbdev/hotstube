const React = require('react')
const Svg = require('./Svg')
const ConfigOptions = require('../../lib/Config')
const semver = require('semver')
const app = require('electron').remote.app
const md = require('marked')
const fs = require('fs')
const _env = require('../../env').env

class ReleaseNotes extends React.Component {
    constructor() {
        super()
        ConfigOptions.load()
        this.state = {
            latestVersion: ConfigOptions.options.releaseNotes
        }
    }
    componentDidMount() {
        ConfigOptions.options.releaseNotes = app.getVersion()
        ConfigOptions.save()

        this.setState({
            changelog: fs.readFileSync(__dirname + '/../../CHANGELOG.md', 'utf8')
        })
    }

    render() {

        return (
            <splash-screen class="changelog">
                <div className="current-version">&lt;{_env}&gt; &nbsp; Current Version: {app.getVersion()}</div>
                <h1>Release Notes</h1>
                {this.state.changelog ? <div dangerouslySetInnerHTML={{__html: md(this.state.changelog)}}></div> : null}

            </splash-screen>
        )
    }
}

module.exports = ReleaseNotes