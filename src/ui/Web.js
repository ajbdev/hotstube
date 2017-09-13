const React = require('react')
const Game = require('./Web/Game')

class Web extends React.Component {
    constructor() {
        super()

        this.state = { game: null }
    }
    componentDidMount() {
        fetch('https://s3.amazonaws.com/hotstube/0c480c32fc2fa939c7fdd6931e6e8c69.json')
            .then((resp) => {
                return resp.json()
            }).then((game) => {
                this.setState({ game: game })
            })
    }
    render() {
        console.log(this.state.game)
        return (
            <app>
                <content>
                    {this.state.game ? <Game game={this.state.game} /> : null}
                </content>
            </app>
        )
    }
}

module.exports = Web