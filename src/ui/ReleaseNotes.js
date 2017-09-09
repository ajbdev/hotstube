const React = require('react')
const Svg = require('./Svg')
const ConfigOptions = require('../lib/Config')
const semver = require('semver')
const app = require('electron').remote.app
const md = require('marked')
const fs = require('fs')

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
            changelog: fs.readFileSync('./CHANGELOG.md', 'utf8')
        })
    }

    render() {
        if (this.state.changelog) {
            console.log(this.state.changelog)
        }

        return (
            <splash-screen class="changelog">
                <div className="current-version">Current Version: {app.getVersion()}</div>
                <h1>Release Notes</h1>
                {this.state.changelog ? <div dangerouslySetInnerHTML={{__html: md(this.state.changelog)}}></div> : null}

            </splash-screen>
        )
    }
}

module.exports = ReleaseNotes