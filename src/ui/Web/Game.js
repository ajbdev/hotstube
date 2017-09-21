const React = require('react')
const Header = require('../Game/Header')
const Highlights = require('../Game/Highlights')
const HighlightVideoWeb = require('../Game/HighlightVideoWeb')

class Game extends React.Component {
    constructor() {
        super()

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

    render() {
        return (
            <game style={this.style()}>
                <Header heroId={1281664} game={this.props.game} />
                <Highlights heroId={1281664} game={this.props.game} highlightVideoComponent={HighlightVideoWeb} />
            </game>
        )
    }
}

module.exports = Game