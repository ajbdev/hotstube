const React = require('react')
const remote = require('electron').remote
const Svg = require('./Svg')

class Game extends React.Component {
    render() {
        if (!this.props.replay) {
            return null
        }

        const game = this.props.replay.game

        return (
            <game>
                <h1>{game.map}</h1>

                <header></header>

                <ul className="tabs">
                    <li>Highlights</li>
                    <li>Kills</li>
                    <li>History</li>
                </ul>
            </game>
        )
    }
}

module.exports = Game