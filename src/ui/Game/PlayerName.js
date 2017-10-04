const React = require('react')
const HeroPortrait = require('./HeroPortrait')
const Talents = require('./../../lib/Talents')
const Talent = require('./Talent')
const {Tooltip}  = require('react-lightweight-tooltip')

class PlayerName extends React.Component { 
    render() {
        let talents = 
            [<span className="talent-tooltip" key="talentTooltip">{this.props.player.hero}</span>, <br key="br" />].concat(
            Talents.get(this.props.player.hero, this.props.player.talents).map((talent) => <Talent key={talent.name} talent={talent} />)
        )

        return (
            <Tooltip content={talents}>
                <player-name class={this.props.player.team}>
                    <HeroPortrait hero={this.props.player.hero} />
                    {this.props.player.name}
                </player-name>
            </Tooltip>
        )
    }
}

module.exports = PlayerName