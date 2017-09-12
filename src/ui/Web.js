const React = require('react')
const Header = require('./Game/Header')

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
                    <game>
                        {this.state.game ? <Header heroId={1281664} game={this.state.game} /> : null}
                    </game>
                </content>
            </app>
        )
    }
}

module.exports = Web