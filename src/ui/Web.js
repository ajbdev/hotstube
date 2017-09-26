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

        if (params.id) {
            fetch(`https://s3.amazonaws.com/hotstube/${params.id}.json`)
            .then((resp) => {
                return resp.json()
            }).then((game) => {
                this.setState({ game: game })
            })
        }
    }
    render() {
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