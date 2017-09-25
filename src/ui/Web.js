const React = require('react')
const Game = require('./Web/Game')
const qs = require('querystring')

class Web extends React.Component {
    constructor() {
        super()

        this.state = { game: null }
    }
    componentDidMount() {

        let params = qs.parse(window.location.search.substring(1))

        console.log(params)

        if (params.game_id) {
            fetch(`https://s3.amazonaws.com/hotstube/${params.game_id}.json`)
            .then((resp) => {
                return resp.json()
            }).then((game) => {
                this.setState({ game: game })
            })
        }
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