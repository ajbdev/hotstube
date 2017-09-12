const React = require('react')
const Svg = require('./Svg')

class HeroPortrait extends React.Component {
    style() {
        let hero = this.props.hero || null
        
        if (!hero && this.props.replay) {
            hero = this.props.replay.game.players.filter((p) => p.id == this.props.replay.heroId)[0].hero
        }

        if (hero) {
            let file = this.props.hero.toLowerCase().replace(/[\W]+/g,"");
            let src = './assets/heroes/'+ file + '.png'

            return {
                backgroundImage: 'url("' + src + '")'
            }
        }

        return {}
    }

    render() {
        return <hero-portrait style={this.style()} {...this.props}>
            {this.props.svg ? <Svg src={this.props.svg} /> : null}
        </hero-portrait>
    }
}
module.exports = HeroPortrait