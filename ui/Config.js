const React = require('react')
const Svg = require('./Svg')

class Config extends React.Component {
    constructor() {
        super()

        this.state = {
            open: false
        }
    }
    render() {
        return (
            <config>
                <Svg src="cog.svg" className="settings-button" onClick={() => { this.setState({open: !this.state.open})} } />
                {this.state.open ? <ConfigWindow /> : null}
            </config>
        )
    }
}

class ConfigWindow extends React.Component {
    render() {
        return (
            <config-window>
                <form>
                    Resolution <br />
                    <label><input type="radio" name="resolution" /> 480p (default)</label>
                    <label><input type="radio" name="resolution" /> 720p</label>
                    <label><input type="radio" name="resolution" /> 1080p</label>
                </form>

            </config-window>
        )
    }
}

module.exports = Config