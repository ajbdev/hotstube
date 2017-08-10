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
                {this.state.open ? <ConfigWindow close={() => { this.setState({ open: false }) } } /> : null}
            </config>
        )
    }
}

class ConfigWindow extends React.Component {
    render() {
        return (
            <config-window className="animated bounceInUp">
                <fieldset>
                <legend>Video Quality</legend>
                    <label><input type="radio" name="resolution" /> 480p (default)</label> <br />
                    <label><input type="radio" name="resolution" /> 720p</label> <br />
                    <label><input type="radio" name="resolution" /> 1080p</label> <br />
                </fieldset>

                <footer>
                    <button className="button button-big" onClick={this.props.close}>Save</button>
                    <button className="button-link button-big" onClick={this.props.close}>Cancel</button>
                </footer>

            </config-window>
        )
    }
}

module.exports = Config