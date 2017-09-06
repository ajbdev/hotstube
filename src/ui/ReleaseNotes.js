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

                {this.version('0.3.3') ?
                <div className="instructions">
                    <b>Version 0.3.3</b> - 9/6/2017 <br /><br />
                    Changes:<br />
                    <ul>
                        <li>Updated artwork for Kel'Thuzad patch and added patch notes.</li>
                    </ul>
                </div> : null}

                {this.version('0.3.2') ?
                <div className="instructions">
                    <b>Version 0.3.2</b> - 9/5/2017 <br /><br />
                    Changes:<br />
                    <ul>
                        <li>Added link to release notes in settings page.</li>
                        <li>Added support for Kel'Thuzad patch.</li>
                        <li>Implemented a basic deploy process for the app and website.</li>
                    </ul>
                </div> : null}

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
        if (!this.state.version || this.props.showAll) {
            return true
        }

        return semver.gt(this.state.latestVersion, version);
    }
}

module.exports = ReleaseNotes