const React = require('react')
const remote = require('electron').remote
const Svg = require('./Svg')

class Game extends React.Component {
    constructor() {
        super()

        this.state = { tab: 'Highlights' }
    }
    renderTab() {
        const components = {
            'GameHighlights': GameHighlights,
            'GameHistory': GameHistory,
            'GameKills': GameKills
        }

        const ContentComponent = components['Game' + this.state.tab]

        return <ContentComponent />
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
            <game>
                <h1>{game.map}</h1>

                <header>
                    {player.name} as {player.hero}
                </header>

                <ul className="tabs">
                    {tabs.map((tab,i) => 
                        <li key={i} className={this.state.tab == tab ? 'active' : ''} onClick={() => changeTab(tab)}><a>{tab}</a></li>
                    )}
                </ul>
                {this.renderTab()}
            </game>
        )
    }
}

class GameHighlights extends React.Component { 
    render() {
        return <tab-content>Highlights</tab-content>
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