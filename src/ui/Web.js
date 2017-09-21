const React = require('react')
const Game = require('./Web/Game')

class Web extends React.Component {
    constructor() {
        super()

        this.state = { game: null }
    }
    componentDidMount() {
        fetch('https://s3.amazonaws.com/hotstube/08865e771548b3c31aeffd7fd715d27d.json')
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