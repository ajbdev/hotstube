const React = require('react')
const remote = require('electron').remote
const Svg = require('./Svg')
const Uploader = require('../Game/Uploader')
const ReplayAnalyzer = require('../../lib/ReplayAnalyzer')
const GameHighlights = require('../Game/Highlights')
const GameScores = require('../Game/Scores')
const pathResolver = require('path')
const fs = require('fs')
const {app, dialog} = require('electron').remote
const Header = require('../Game/Header')
const HighlightVideoComponent = require('../Game/HighlightVideoFile')

class Game extends React.Component {
    constructor(props) {
        super()

        this.state = { 
            tab: 'Highlights',
            uploading: false
        }
    }
    renderTab() {
        const components = {
            'GameHighlights': GameHighlights,
            'GameScores': GameScores
        }

        const ContentComponent = components['Game' + this.state.tab]

        return <ContentComponent highlightVideoComponent={HighlightVideoComponent} replay={this.props.replay} game={this.props.replay.game} heroId={this.props.replay.heroId} setStatus={this.props.setStatus} />
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
    corruptReplay() {
        return (
            <game className="corrupt">
                <Svg src="poopface.svg" />
                <h1>Woops! This replay file cannot be opened</h1>
                This is probably happening for one of the following reasons:
                <br />
                <div className="reasons">
                    <ol>
                        <li>There's a new Heroes patch and HotSTube has not been updated yet.</li>
                        <li>Your version of HotSTube is outdated.</li>
                        <li>This replay file is incomplete or damaged.</li>
                    </ol>
                </div>
                <p>
                    Make sure HotSTube is up to date or <a onClick={() => this.props.deleteReplay(this.props.replay)}>delete the replay file</a> to remove it from the list.
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

        if (this.props.replay.corrupt) {
            return this.corruptReplay()
        }
        
        if (!this.props.replay.game) {
            return this.loading()
        }

        const game = this.props.replay.game

        const tabs = ['Highlights', 'Scores']

        const actions = {
            'Upload Game': this.uploading.bind(this),
            'Export Data': this.export.bind(this),
            'Delete Replay': this.props.deleteReplay
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