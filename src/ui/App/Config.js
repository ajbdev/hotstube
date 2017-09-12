const React = require('react')
const Svg = require('./Svg')
const ConfigOptions = require('../../lib/Config')
const os = require('os')
const fs = require('fs')
const pathResolver = require('path')
const HighlightDir = require('../../lib/HighlightDir')
const {dialog} = require('electron').remote

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
                        this.props.configWindow('config')
                }}/> {!!this.props.window
                    ? <ConfigWindow
                            openReleaseNotes={this.props.openReleaseNotes}
                            configWindow={this.props.configWindow}
                            window={this.props.window}
                            errorCheck={this.props.errorCheck}
                            setStatus={this.props.setStatus}
                            close={() => {
                            this.props.configWindow(null)
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

        this.props.setStatus('Filters set', {expire: 10000})

        this.props.close()

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

class DirectoriesConfigWindow extends React.Component {

    save() {
        ConfigOptions.options = this.props.options
        ConfigOptions.save()

        this.props.setStatus('Filters set', {expire: 10000})

        this.props.close()

    }

    selectDirectory() {
        let path = dialog.showOpenDialog({properties: ['openDirectory']})

        if (path) {
            this.props.handleOption(path[0], 'accountDir')
        }
    }

    recursivelySearch(dir) {

        if (!fs.lstatSync(dir).isDirectory()) return dir;
        
        return fs.readdirSync(dir).map(f => this.recursivelySearch(pathResolver.join(dir, f)))
    }

    checkForStormReplay() {
        if (!fs.existsSync(this.props.options.accountDir)) {
            return false
        }

        const flatten = arr => arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val), []);
  
        let files = flatten(this.recursivelySearch(this.props.options.accountDir))
        for (var i in files) {
            let file = files[i]

            if (pathResolver.extname(file) === '.StormReplay') {
                console.log('Found stormreplay')
                return true
            }
        }
        console.log('Did not find stormreplay')
        return false
    }

    render() {
        const hasReplay = this.checkForStormReplay()

        const css = ['input-group']

        if (!hasReplay) {
            css.push('input-invalid')
        } else {
            css.push('input-valid')
        }

        return (
            <config-window>
                <fieldset>
                    <legend>Game Directories</legend>

                    <label>Replay Directory</label>
                    <div className={css.join(' ')}>
                        <input type="text" 
                            value={this.props.options.accountDir} 
                            onChange={(evt) => this.props.handleOption(evt.target.value, 'accountDir')} />
                        <button type="button" className="button" onClick={this.selectDirectory.bind(this)}>Browse</button>
                    </div>
                    {!hasReplay ? <p className="hint error">No replay files found in this directory or it's subdirectories. Are you sure this is the correct folder?</p> : null}
                    <footer>
                        <button className="button" onClick={this.save.bind(this)}>Save</button>
                        <button className="button-link" onClick={this.props.close}>Cancel</button>
                    </footer>
                </fieldset>
            </config-window>
        )
    }
}

class AdvancedConfigWindow extends React.Component {
    constructor() {
        super()
        this.state = {}
    }
    componentDidMount() {
        this.diskUsage()
    }
    
    pruneHighlights() {
        const highlightDir = new HighlightDir(this.props.options.highlightDir)
        highlightDir.prune(this.props.options.highlightLifetimeDays)
        this.diskUsage()
    }
    diskUsage() {
        const highlightDir = new HighlightDir(this.props.options.highlightDir)
        const total = this.humanizeSize(highlightDir.size())
        const pruneSize =this.humanizeSize(highlightDir.size(highlightDir.findOlderThan(this.props.options.highlightLifetimeDays)))


        this.setState({
            totalDiskUsage: total,
            pruneSize: pruneSize,
        })
    }
    humanizeSize(bytes) {
        let i = Math.floor(Math.log(bytes) / Math.log(1024));
        return !bytes && '0 Bytes' || (bytes / Math.pow(1024, i)).toFixed(2) + " " + ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][i]   
    }

    selectDirectory() {
        let path = dialog.showOpenDialog({properties: ['openDirectory'], defaultPath: this.props.options.highlightDir })

        if (path) {
            this.props.handleOption(path[0], 'highlightDir')
        }
    }
    changeHighlightLifetimeDays(evt) {
        this.props.handleOption(evt.target.value, 'highlightLifetimeDays')
        this.diskUsage()
    }
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

                <fieldset>
                    <legend>Video Storage Options</legend>
                    
                    <label>Directory</label>
                    <div className="input-group">
                        <input type="text" 
                            value={this.props.options.highlightDir} 
                            onChange={(evt) => this.props.handleOption(evt.target.value, 'highlightDir')} />
                        <button type="button" className="button" onClick={this.selectDirectory.bind(this)}>Browse</button>
                    </div>

                    <label>
                        <input
                            type="checkbox"
                            checked={this.props.options.deleteHighlights}
                            onChange={(evt) => this.props.handleOption(!this.props.options.deleteHighlights, 'deleteHighlights')}/>
                        Delete highlights older than
                        <input
                            type="number"
                            onChange={this.changeHighlightLifetimeDays.bind(this)}
                            className="inline"
                            value={this.props.options.highlightLifetimeDays}/>
                        days
                    </label><br/>

                    <p className="hint-sub">
                        Current disk usage: {this.state.totalDiskUsage}
                        {this.props.options.deleteHighlights && this.state.pruneSize !== '0 Bytes' ? <span> (<a onClick={this.pruneHighlights.bind(this)}>Prune Now</a> to save {this.state.pruneSize})</span>: null}
                    </p>
                </fieldset>

                <footer>
                    <button className="button-link" onClick={this.props.close}>Close</button>
                    <a className="float-right button-link-tertiary" onClick={this.clearReplayCache.bind(this)}>Clear Replay Cache</a>
                </footer>
            </config-window>
        )
    }
    clearReplayCache() {
        if (!confirm('Are you sure you want to clear the replay cache?')) {
            return
        }


        localStorage.clear()
        this.props.setStatus('Replay cache cleared')
    }
}

class ConfigWindow extends React.Component {
    constructor() {
        super()

        ConfigOptions.load()

        this.state = {
            options: ConfigOptions.options
        }

        this.handleOption = this.handleOption.bind(this)
    }


    cancel() {
        ConfigOptions.load()

        this.props.close()
    }
    save() {
        ConfigOptions.options = this.state.options
        ConfigOptions.save()

        this.props.setStatus('Settings saved', {expire: 10000})

        this.props.close()

        this.props.errorCheck()
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
                    disabled={!this.state.options.enableRecording}
                    onChange={(evt) => this.handleOption(evt.target.value, 'sound')}
                    checked={this.state.options.sound === 'off'}/>
                    Off (default)
                </label>
                <br/>
                <label><input
                    type="radio"
                    name="sound"
                    value="on"
                    disabled={!this.state.options.enableRecording}
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

    loadReleaseNotes() {
        this.props.openReleaseNotes()

        this.props.close()
    }

    render() {
        if (!this.state.options) {
            return null
        }
        if (this.props.window == 'directories') {
            return <DirectoriesConfigWindow
                options={this.state.options}
                setStatus={this.props.setStatus}
                handleOption={this.handleOption}
                close={() => this.props.configWindow(null)}/>
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
                errorCheck={this.props.errorCheck}
                setStatus={this.props.setStatus}
                handleOption={this.handleOption}
                close={() => this.props.configWindow('config')}/>
        }

        return (
            <config-window>
                <fieldset>
                    <legend>Recording</legend>
                    <label><input
                        type="checkbox"
                        checked={this.state.options.enableRecording}
                        onChange={(evt) => this.handleOption(!this.state.options.enableRecording, 'enableRecording')}/>
                        Enable recording
                    </label>
                    <h5>Video Quality</h5>
                    <label><input
                        type="radio"
                        name="resolution"
                        value="480p"
                        disabled={!this.state.options.enableRecording}
                        onChange={(evt) => this.handleOption(evt.target.value, 'resolution')}
                        checked={this.state.options.resolution === '480p'}/>
                        480p (default)
                    </label>
                    <br/>
                    <label><input
                        type="radio"
                        name="resolution"
                        value="720p"
                        disabled={!this.state.options.enableRecording}
                        onChange={(evt) => this.handleOption(evt.target.value, 'resolution')}
                        checked={this.state.options.resolution === '720p'}/>
                        720p
                    </label>
                    <br/>
                    <label><input
                        type="radio"
                        name="resolution"
                        value="1080p"
                        disabled={!this.state.options.enableRecording}
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
                    <button className="button" onClick={this.save.bind(this)}>Save</button>
                    <button className="button-link" onClick={this.cancel.bind(this)}>Cancel</button>
                    
                    <div className="float-right">
                     <a className="button-link-tertiary" onClick={this.loadReleaseNotes.bind(this)}>
                         Release Notes
                     </a>
                     <a className="button-link-tertiary" 
                        onClick={() => this.props.configWindow('advanced')}>Advanced..</a>
                    </div>

                </footer>

            </config-window>
        )
    }
}

module.exports.Config = Config
module.exports.FiltersConfigWindow = FiltersConfigWindow