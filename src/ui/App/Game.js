const React = require('react')
const remote = require('electron').remote
const Svg = require('./Svg')
const Uploader = require('../Game/Uploader')
const ReplayAnalyzer = require('../../lib/ReplayAnalyzer')
const GameHighlights = require('../Game/Highlights').Highlights
const GameScores = require('../Game/Scores')
const GameXP = require('../Game/XP')
const GameFullVideo = require('../Game/FullVideo')
const ConfigOptions = require('../../lib/Config')
const pathResolver = require('path')
const fs = require('fs')
const {app, dialog} = require('electron').remote
const Header = require('../Game/Header')

class Game extends React.Component {
    constructor(props) {
        super()

        this.state = { 
            tab: 'Highlights',
            uploading: false
        }
    }
    componentWillReceiveProps(newProps) {
        if (newProps.replay != this.props.replay) {
            this.setState({ tab: 'Highlights' })
        }
    }
    renderTab() {
        const components = {
            'GameHighlights': GameHighlights,
            'GameScores': GameScores,
            'GameXP': GameXP
        }

        if (this.props.replay.game.video) {
            components['GameFullVideo'] = GameFullVideo
        }

        const ContentComponent = components['Game' + this.state.tab]

        return <ContentComponent replay={this.props.replay} game={this.props.replay.game} />
    }
    style() {
        if (this.props.replay.game) {
            let file = this.props.replay.game.map.toLowerCase().replace(/[\W]+/g,"");
            let src = './assets/backgrounds/'+ file + '.jpeg'

            return {
                backgroundImage: 'url("' + src + '")'
            }
        }

        return {}
    }
    restart() {
        app.relaunch()
        app.exit(0)
    }
    updatingProtocols() {
        return (
            <game className="corrupt">
                
                <br /><br /><br />
                <h1>Updating for the latest HotS patch...</h1>
                Hang tight, this should be done soon!
            </game>
        )
    }
    corruptReplay() {
        return (
            <game className="corrupt">
                <Svg src="poopface.svg" />
                <h1>Woops! This replay file cannot be opened</h1>
                This is probably happening for one of the following reasons:
                <br />
                <div className="reasons">
                    <ol>
                        <li>There's a new Heroes patch and you need to <a onClick={this.restart.bind(this)}>restart HotSTube</a>.</li>
                        <li>Your version of HotSTube is outdated.</li>
                        <li>This replay file is incomplete or damaged.</li>
                    </ol>
                </div>
                <p>
                    <a onClick={this.restart.bind(this)}>Restart HotSTube</a> to update or <a onClick={() => this.props.deleteReplay(this.props.replay)}>delete the replay file</a> to remove it from the list.
                </p>
            </game>
        )
    }
    loading() {
        return (
            <game className="corrupt">
                <br /><br /><br />
                <h1>This game is still being processed.</h1>
                Hang tight, this should be done soon!
            </game>
        )
    }
    export() {
        let fileName = pathResolver.join(app.getPath('documents'),pathResolver.basename(this.props.replay.name, '.StormReplay') + '.json')

        let self = this;

        dialog.showSaveDialog({
            title: 'Export replay data',
            buttonLabel: 'Export',
            showsTagField: false,
            defaultPath: fileName,
            filters: [
                {name: 'JSON', extensions: ['json']},
              ]
        }, (file) => {
            console.log(file + ' saved')
            if (file) {
                fs.writeFile(file, JSON.stringify(this.props.replay.game), (err) => {
                    if (!err) {
                        self.props.setStatus('Data exported to ' + file, { expire: 10000 })
                        return
                    }
                    self.props.setStatus('Error exporting data: ' + err)
                })
            }
        })
    }
    closeDropdown(event) {
         if (event.target.getAttribute('class') !== 'dropdown-trigger') {
             this.setState({ headerMenuOpen: false })
         }
    }
    changeTab(tab) {
        this.setState({ tab: tab })
    }
    uploading() {
        this.setState({ uploading: true })
    }
    render() {
        if (!this.props.replay) {
            return null
        }
        if (this.props.replay.updatingProtocols) {
            return this.updatingProtocols()
        }

        if (this.props.replay.corrupt) {
            return this.corruptReplay()
        }
        
        if (!this.props.replay.game) {
            return this.loading()
        }

        const game = this.props.replay.game

        const tabs = {
            'Highlights': 'Highlights',
            'Scores': 'Scores',
        }

        if (this.props.replay.game.video) {
            tabs['FullVideo'] = 'Video'
        }

        const actions = {
            'Upload Game': this.uploading.bind(this),
            'Export Data': this.export.bind(this),
            'Delete Replay': () => { this.props.deleteReplay(this.props.replay) }
        }

        return (
            <game style={this.style()} onClick={this.closeDropdown.bind(this)}>
                
                {this.state.uploading ? <Uploader replay={this.props.replay} close={() => this.setState({ uploading: false })} /> : null}
                <Header game={this.props.replay.game} 
                        replay={this.props.replay} 
                        tabs={tabs} 
                        tab={this.state.tab}
                        changeTab={this.changeTab.bind(this)} 
                        actions={actions}
                />
                {this.renderTab()}
            </game>
        )
    }
}
module.exports = Game