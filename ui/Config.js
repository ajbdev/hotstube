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

class AdvancedConfigWindow extends React.Component {
    render() {
        return (
            <config-window>
                <fieldset>
                    <legend>Highlight Options</legend>
                        <label><input type="checkbox" checked="checked" disabled="disabled" /> Record anytime you get a kill </label> <br /> 
                        <label><input type="checkbox" checked={this.props.options.recordAssists} onChange={(evt) => this.props.handleOption(!this.props.options.recordAssists, 'recordAssists')} /> Record anytime you get an assist </label> <br /> 

                        <label> Start recording <input type="number" 
                                                       onChange={(evt) => this.props.handleOption(evt.target.value, 'recordPrekillSeconds')}
                                                       className="inline" 
                                                       value={this.props.options.recordPrekillSeconds} /> seconds before kill occurs </label><br /> 

                        <label>Record for at least <input type="number" 
                                                          onChange={(evt) => this.props.handleOption(evt.target.value, 'recordMinimumSeconds')}
                                                          className="inline" 
                                                          value={this.props.options.recordMinimumSeconds} /> seconds</label>

                </fieldset>
                
                <footer>
                    <button className="button-link" onClick={this.props.close}>Close</button>
                </footer>
            </config-window>
        )
    }
}

class ConfigWindow extends React.Component {
    constructor() {
        super()

        ConfigOptions.load()

        this.state = {
            options: ConfigOptions.options,
            openAdvanced: false
        }
        
        this.save = this.save.bind(this)
        this.handleOption = this.handleOption.bind(this)
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

        if (this.state.openAdvanced) {
            return <AdvancedConfigWindow options={this.state.options} handleOption={this.handleOption} close={() => this.setState({ openAdvanced: false })} />
        }

        return (
            <config-window>
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
                    {this.state.options.resolution !== '480p' ?
                        <p className="hint">
                            Saved highlights file size will be significantly increased and your system performance may decrease during game. 
                        </p> :
                        null
                    }
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
                    {this.state.options.sound === 'on' ? 
                        <p className="hint">
                            All sound (microphone, music players, etc) will be recorded and overall highlights filesize will be increased.
                        </p> : 
                        null 
                    }
                </fieldset>

                <footer>
                    <button className="button" onClick={this.save}>Save</button>
                    <button className="button-link" onClick={this.props.close}>Cancel</button>

                    <a className="float-right button-link-tertiary" onClick={() => this.setState({ openAdvanced: true }) }>Advanced..</a>
                </footer>

            </config-window>
        )
    }
}

module.exports = Config