const React = require('react')
const remote = require('electron').remote
const Svg = require('./Svg')
const ReplayAnalyzer = require('../lib/ReplayAnalyzer')
const GameHighlights = require('./Game/Highlights')
const HeroPortrait = require('./HeroPortrait')
const Time = require('./Time')

class Game extends React.Component {
    constructor() {
        super()

        this.state = { tab: 'Highlights' }
    }
    componentDidMount() {
        const analyzer = new ReplayAnalyzer(this.props.replay.name)

        analyzer.analyze(true)
    }
    renderTab() {
        const components = {
            'GameHighlights': GameHighlights,
            'GameHistory': GameHistory,
            'GameKills': GameKills
        }

        const ContentComponent = components['Game' + this.state.tab]

        return <ContentComponent replay={this.props.replay} />
    }
    style() {
        if (this.props.replay.game) {
            let file = this.props.replay.game.map.toLowerCase().replace(/[\W]+/g,"");
            let src = './assets/backgrounds/'+ file + '.png'

            return {
                backgroundImage: 'url("' + src + '")'
            }
        }

        return {}
    }
    render() {
        if (!this.props.replay) {
            return null
        }

        const game = this.props.replay.game

        let player = game.players.filter((p) => p.id === this.props.replay.heroId)[0]

        const changeTab = (tab) => {
            this.setState({ tab: tab })
        }
        
        const tabs = ['Highlights', 'Kills', 'History']

        return (
            <game style={this.style()}>
                <header>
                    <h1>{game.map}</h1>

                    {player.name} as <HeroPortrait class="small" hero={player.hero} /> {player.hero} for <Time seconds={game.time} />
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

class GameKills extends React.Component { 
    render() {
        return <tab-content>Kills</tab-content>
    }
}

class GameHistory extends React.Component { 
    render() {
        return <tab-content>History</tab-content>
    }
}

module.exports = Game