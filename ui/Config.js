const React = require('react')
const Svg = require('./Svg')
const ConfigOptions = require('../lib/Config')

class Config extends React.Component {
    constructor() {
        super()

        ConfigOptions.load()

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
    constructor() {
        super()

        ConfigOptions.load()

        this.state = {
            options: ConfigOptions.options
        }
        
        this.save = this.save.bind(this);
    }

    save() {
        ConfigOptions.options = this.state.options
        ConfigOptions.save()

        this.props.close()
    }

    handleOption(value, option) {
        this.setState({
            options: Object.assign(this.state.options, { [option]: value })
        })
    }

    render() {
        if (!this.state.options) {
            return null
        }

        return (
            <config-window className="animated bounceInUp">
                <fieldset>
                    <legend>Recording</legend>
                    <h5>Video Quality</h5>
                    <label><input type="radio" name="resolution" value="480p" 
                                                onChange={(evt) => this.handleOption(evt.target.value, 'resolution')}
                                                checked={this.state.options.resolution === '480p'} 
                                                /> 480p (default)
                    </label> <br />
                    <label><input type="radio" name="resolution" value="720p" 
                                                onChange={(evt) => this.handleOption(evt.target.value, 'resolution')}
                                                checked={this.state.options.resolution === '720p'}
                                                /> 720p
                    </label> <br />
                    <label><input type="radio" name="resolution" value="1080p" 
                                                onChange={(evt) => this.handleOption(evt.target.value, 'resolution')}
                                                checked={this.state.options.resolution === '1080p'} 
                                                /> 1080p
                    </label>
                    <p className="hint">
                        Saved highlights file size is significantly increased at higher resolutions.
                    </p>
                    <br />
                    <h5>Sound</h5>
                    <label><input type="radio" name="sound" value="off" 
                                    onChange={(evt) => this.handleOption(evt.target.value, 'sound')}
                                    checked={this.state.options.sound === 'off'} 
                                    /> Off (default)
                    </label> <br />
                    <label><input type="radio" name="sound" value="on" 
                                    onChange={(evt) => this.handleOption(evt.target.value, 'sound')}
                                    checked={this.state.options.sound === 'on'} 
                                    /> On
                    </label>
                    <p className="hint">
                        All sound (microphone, music players, etc) will be recorded if enabled.
                    </p>
                </fieldset>

                <footer>
                    <button className="button" onClick={this.save}>Save</button>
                    <button className="button-link" onClick={this.props.close}>Cancel</button>
                </footer>

            </config-window>
        )
    }
}

module.exports = Config