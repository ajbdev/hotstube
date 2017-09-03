const React = require('react')
const Svg = require('./Svg')
const ConfigOptions = require('../lib/Config')
const semver = require('semver')
const app = require('electron').remote.app

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
    }
    render() {
        return (
            <splash-screen>
                <h1>Release Notes</h1>

                {this.version('0.3.1') ?
                <div className="instructions">
                    <b>Version 0.3.1</b> - 9/3/2017 <br /><br />
                    Changes:<br />
                    <ul>
                        <li>Fixed a bug where videos appeared as a gray screen.</li>
                        <li>Fixed a bug where certain videos wouldn't display from group fights.</li>
                    </ul>
                </div> : null}

                {this.version('0.3.0') ?
                <div className="instructions">
                    <b>Version 0.3.0</b> - 9/3/2017 <br /><br />
                    Changes:<br />
                    <ul>
                        <li>Improved loading time of highlights.</li>
                        <li>Added blue camera icon next to replays containing highlight.</li>
                        <li>Added the release notes screen.</li>
                    </ul>
                </div> : null}
            </splash-screen>
        )
    }
    version(version) {
        if (!this.state.version) {
            return true
        }

        return semver.gt(this.state.latestVersion, version);
    }
}

module.exports = ReleaseNotes