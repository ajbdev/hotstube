const React = require('react')
const Header = require('../Game/Header')
const GameHighlights = require('../Game/Highlights')
const GameScores = require('../Game/Scores')

class Game extends React.Component {
    constructor() {
        super()

        this.state = { 
            tab: 'Highlights'
        }
    }

    style() {
        if (this.props.game) {
            let file = this.props.game.map.toLowerCase().replace(/[\W]+/g,"");
            let src = './assets/backgrounds/'+ file + '.jpeg'

            return {
                backgroundImage: 'url("' + src + '")'
            }
        }

        return {}
    }

    changeTab(tab) {
        this.setState({ tab: tab })
    }

    renderTab() {
        const components = {
            'GameHighlights': GameHighlights,
            'GameScores': GameScores
        }

        const ContentComponent = components['Game' + this.state.tab]

        return <ContentComponent game={this.props.game} />
    }

    render() {
        const tabs = ['Highlights', 'Scores']
        return (
            <game style={this.style()} className="web">
                <Header game={this.props.game} 
                        tabs={tabs} 
                        changeTab={this.changeTab.bind(this)} 
                        tab={this.state.tab} />
                {this.renderTab()}
            </game>
        )
    }
}

module.exports = Game