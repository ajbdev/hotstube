const React = require('react')
const remote = require('electron').remote
const Svg = require('./Svg')
const ReplayAnalyzer = require('../lib/ReplayAnalyzer')
const GameHighlights = require('./Game/Highlights')
const GameScores = require('./Game/Scores')
const HeroPortrait = require('./HeroPortrait')
const Uploader = require('./Game/Uploader')
const Time = require('./Time')
const pathResolver = require('path')
const fs = require('fs')
const {app, dialog} = require('electron').remote

class Game extends React.Component {
    constructor(props) {
        super()

        this.state = { tab: 'Highlights', headerMenuOpen: false }
    }
    renderTab() {
        const components = {
            'GameHighlights': GameHighlights,
            'GameScores': GameScores
        }

        const ContentComponent = components['Game' + this.state.tab]

        return <ContentComponent replay={this.props.replay} setStatus={this.props.setStatus} />
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

        let player = game.players.filter((p) => p.id === this.props.replay.heroId)[0]

        const changeTab = (tab) => {
            this.setState({ tab: tab })
        }
        
        const tabs = ['Highlights', 'Scores']

        const dropdownCss = ['dropdown']
        if (this.state.headerMenuOpen) {
            dropdownCss.push('active')
        }

        return (
            <game style={this.style()} onClick={this.closeDropdown.bind(this)}>
                <header>
                    {this.state.uploading ? <Uploader replay={this.props.replay} /> : null}
                    <h1>{game.map}</h1>
                    {player.name} as <HeroPortrait class="small" hero={player.hero} /> {player.hero} for <Time seconds={game.time} />
                    <div className="actions">
                        <div className={dropdownCss.join(' ')}>
                            <button type="button" className="dropdown-trigger" onClick={() => this.setState({ headerMenuOpen: !this.state.headerMenuOpen })}>
                                &bull;&bull;&bull;
                            </button>
                            <div className="dropdown-menu">
                                {/* <a onClick={() => this.setState({ uploading: true })}>Upload Game</a> */}
                                <a onClick={this.export.bind(this)}>Export data</a>
                                <a onClick={() => this.props.deleteReplay(this.props.replay)}>Delete replay</a>
                            </div>
                        </div>
                    </div>
                    <ul className="tabs">
                        {tabs.map((tab,i) => 
                            <li key={i} className={this.state.tab == tab ? 'active' : ''} onClick={() => changeTab(tab)}><a>{tab}</a></li>
                        )}
                    </ul>
                </header>
                {this.renderTab()}
            </game>
        )
    }
}

class GameHistory extends React.Component { 
    render() {
        return <tab-content>History</tab-content>
    }
}

module.exports = Game