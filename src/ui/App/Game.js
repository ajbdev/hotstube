const React = require('react')
const remote = require('electron').remote
const Svg = require('./Svg')
const ReplayAnalyzer = require('../lib/ReplayAnalyzer')
const GameHighlights = require('./Game/Highlights')
const GameScores = require('./Game/Scores')
const HeroPortrait = require('./HeroPortrait')
const pathResolver = require('path')
const fs = require('fs')
const {app, dialog} = require('electron').remote
const Header = require('./Game/Header')

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

        let deaths = game.scores.filter((s) => s.type == 'Deaths')[0].values
        let teamKills = [0,0]
        game.players.map((p) => {
            teamKills[p.teamId == 0 ? 1 : 0] += deaths[p.playerId-1]
        })

        let outcome = player.outcome == 'Win' ? 'win' : 'loss'

        return (
            <game style={this.style()} onClick={this.closeDropdown.bind(this)}>
                <Header game={this.props.game} />
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