const React = require('react')
const Svg = require('./Svg')

class GameInProgress extends React.Component {
    constructor() {
        super()
    }

    render() {
        return (
            <game className="corrupt">
                <Svg src="logo.svg" />
                <h1>Game in progress</h1>
                <p>
                    Highlights will be available as soon as this game is finished.
                </p>
            </game>
        )
    }
}

module.exports = GameInProgress