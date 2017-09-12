const React = require('react')
const HeroPortrait = require('./HeroPortrait')

class PlayerName extends React.Component { 
    render() {
        return (
            <player-name class={this.props.player.team}>
                <HeroPortrait hero={this.props.player.hero} />
                {this.props.player.name}
            </player-name>
        )
    }
}

module.exports = PlayerName