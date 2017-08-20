const React = require('react')
const Svg = require('./Svg')
const ConfigOptions = require('../lib/Config')
const os = require('os')

class Config extends React.Component {
    constructor(props) {
        super()

        ConfigOptions.load()
    }

    render() {
        return (
            <config>
                <Svg
                    src="cog.svg"
                    className="settings-button"
                    onClick={() => {
                        this
                            .props
                            .configWindow('config')
                }}/> {!!this.props.window
                    ? <ConfigWindow
                            configWindow={this.props.configWindow}
                            window={this.props.window}
                            setStatus={this.props.setStatus}
                            close={() => {
                            this
                                .props
                                .configWindow(null)
                        }}/>
                    : null}
            </config>
        )
    }
}

class FiltersConfigWindow extends React.Component {

    save() {
        ConfigOptions.options = this.props.options
        ConfigOptions.save()

        this
            .props
            .setStatus('Filters set', {expire: 10000})

        this
            .props
            .close()
    }

    render() {
        return (
            <config-window>
                <fieldset>
                    <legend>Search Options</legend>

                    <label><input
                        type="checkbox"
                        checked={this.props.options.showPatches}
                        onChange={(evt) => this.props.handleOption(!this.props.options.showPatches, 'showPatches')}/>
                        Show patches
                    </label>
                    <br/>

                </fieldset>

                <footer>
                    <button className="button" onClick={this.save.bind(this)}>Save</button>
                    <button className="button-link" onClick={this.props.close}>Cancel</button>
                </footer>
            </config-window>
        )
    }
}

class AdvancedConfigWindow extends React.Component {

    render() {
        return (
            <config-window>
                <fieldset>
                    <legend>Highlight Options</legend>
                    <label><input type="checkbox" checked="checked" disabled="disabled"/>
                        Record anytime you get a kill
                    </label>
                    <br/>
                    <label><input
                        type="checkbox"
                        checked={this.props.options.recordAssists}
                        onChange={(evt) => this.props.handleOption(!this.props.options.recordAssists, 'recordAssists')}/>
                        Record anytime you get an assist
                    </label>
                    <br/>

                    <label>
                        Start recording
                        <input
                            type="number"
                            onChange={(evt) => this.props.handleOption(evt.target.value, 'recordPrekillSeconds')}
                            className="inline"
                            value={this.props.options.recordPrekillSeconds}/>
                        seconds before kill occurs
                    </label><br/>

                    <label>Record for at least
                        <input
                            type="number"
                            onChange={(evt) => this.props.handleOption(evt.target.value, 'recordMinimumSeconds')}
                            className="inline"
                            value={this.props.options.recordMinimumSeconds}/>
                        seconds</label><br />

                    <label><input
                        type="checkbox"
                        checked={this.props.options.fullVideoControls}
                        onChange={(evt) => this.props.handleOption(!this.props.options.fullVideoControls, 'fullVideoControls')}/>
                        Show full video player controls
                    </label>
                    <br/>
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
            options: ConfigOptions.options
        }

        this.save = this
            .save
            .bind(this)
        this.handleOption = this
            .handleOption
            .bind(this)
    }

    save() {
        ConfigOptions.options = this.state.options
        ConfigOptions.save()

        this
            .props
            .setStatus('Settings saved', {expire: 10000})

        this
            .props
            .close()
    }

    handleOption(value, option) {
        this.setState({
            options: Object.assign(this.state.options, {[option]: value})
        })
    }

    renderSoundForm() {
        if (os.platform() == 'darwin') {
            return null
        }

        return (
            <div>
                <h5>Sound</h5>
                <label><input
                    type="radio"
                    name="sound"
                    value="off"
                    onChange={(evt) => this.handleOption(evt.target.value, 'sound')}
                    checked={this.state.options.sound === 'off'}/>
                    Off (default)
                </label>
                <br/>
                <label><input
                    type="radio"
                    name="sound"
                    value="on"
                    onChange={(evt) => this.handleOption(evt.target.value, 'sound')}
                    checked={this.state.options.sound === 'on'}/>
                    On
                </label>
                {this.state.options.sound === 'on'
                    ? <p className="hint">
                            All sound (microphone, music players, etc) will be recorded and overall
                            highlights filesize will be increased.
                        </p>
                    : null
}
            </div>
        )
    }

    render() {
        if (!this.state.options) {
            return null
        }

        if (this.props.window == 'filters') {
            return <FiltersConfigWindow
                options={this.state.options}
                setStatus={this.props.setStatus}
                handleOption={this.handleOption}
                close={() => this.props.configWindow(null)}/>
        }

        if (this.props.window == 'advanced') {
            return <AdvancedConfigWindow
                options={this.state.options}
                setStatus={this.props.setStatus}
                handleOption={this.handleOption}
                close={() => this.props.configWindow('config')}/>
        }

        return (
            <config-window>
                <fieldset>
                    <legend>Recording</legend>
                    <h5>Video Quality</h5>
                    <label><input
                        type="radio"
                        name="resolution"
                        value="480p"
                        onChange={(evt) => this.handleOption(evt.target.value, 'resolution')}
                        checked={this.state.options.resolution === '480p'}/>
                        480p (default)
                    </label>
                    <br/>
                    <label><input
                        type="radio"
                        name="resolution"
                        value="720p"
                        onChange={(evt) => this.handleOption(evt.target.value, 'resolution')}
                        checked={this.state.options.resolution === '720p'}/>
                        720p
                    </label>
                    <br/>
                    <label><input
                        type="radio"
                        name="resolution"
                        value="1080p"
                        onChange={(evt) => this.handleOption(evt.target.value, 'resolution')}
                        checked={this.state.options.resolution === '1080p'}/>
                        1080p
                    </label>
                    {this.state.options.resolution !== '480p'
                        ? <p className="hint">
                                Saved highlights file size will be significantly increased and your system
                                performance may decrease during game.
                            </p>
                        : null
}
                    <br/> {this.renderSoundForm()}
                </fieldset>

                <footer>
                    <button className="button" onClick={this.save}>Save</button>
                    <button className="button-link" onClick={this.props.close}>Cancel</button>

                    <a
                        className="float-right button-link-tertiary"
                        onClick={() => this.props.configWindow('advanced')}>Advanced..</a>
                </footer>

            </config-window>
        )
    }
}

module.exports.Config = Config
module.exports.FiltersConfigWindow = FiltersConfigWindow
