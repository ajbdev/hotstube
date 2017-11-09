const React = require('react')
const Svg = require('../App/Svg')
const HeroesPatchNotes = require('../../lib/HeroesPatchNotes')

class HeroPortrait extends React.Component {
    constructor() {
        super()
        this.state = { style: {} }
    }
    style() {
        let hero = this.props.hero || null
        let self = this
        
        if (!hero && this.props.replay) {
            hero = this.props.replay.game.players.filter((p) => p.id == this.props.replay.heroId)[0].hero
        }

        if (hero) {
            let heroName = this.props.hero.toLowerCase().replace(/[\W]+/g,"");

            if (heroName == 'nexus') {
                if (!this.unmounted) {
                    self.setState({
                        style: {
                            backgroundImage: 'url(assets/png/nexus.png)'
                        }
                    })
                }
                return
            }

            HeroesPatchNotes.hero(heroName).then((h) => {
                if (!this.unmounted) {
                    self.setState({
                        style: {
                            backgroundImage: 'url(' + h.image + ')'
                        }
                    })
                }
            }, () => {
                // Swallow the rejection
            })
        }
    }
    componentWillUnmount() {
        this.unmounted = true
    }
    componentDidMount() {
        this.style()
        this.unmounted = false
    }

    render() {

        return (
            <hero-portrait style={this.state.style} {...this.props}>
                {this.props.svg ? <Svg src={this.props.svg} /> : null}
            </hero-portrait>
        )
    }
}
module.exports = HeroPortrait