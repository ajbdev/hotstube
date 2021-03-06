const React = require('react')
const Time = require('../Time')
const HeroPortrait = require('./HeroPortrait')
const Players = require('../../lib/Players')

class Header extends React.Component {
    constructor(props) {
        super()

        this.state = { menu: false }
    }
    handleClickOutside(e) {
        if (['dropdown-trigger','dropdown-menu'].indexOf(e.target.className) === -1) {
            this.setState({ menu: false })
        }
    }
    render() {
        const game = this.props.game
        
        const dropdownCss = ['dropdown']
        if (this.state.menu) {
            dropdownCss.push('active')
        }
        
        let deaths = game.scores.filter((s) => s.type == 'Deaths')[0].values

        const players = new Players(game.players)

        let teamKills = [0,0]
        game.players.map((p) => {
            teamKills[p.teamId == 0 ? 1 : 0] += deaths[p.playerId-1]
        })

        let player = players.replayOwner()

        let outcome = ''

        if (player && player.outcome) {
            outcome = player.outcome
        }

        return (
            <header onClick={this.handleClickOutside.bind(this)}>
                <h1>
                    {this.props.game.map}
                    <span className={"outcome " + outcome.toLowerCase()}>{outcome}</span>
                </h1>
                <div className="kills">       
                    <span className="red">
                        {teamKills[0]}
                    </span>
                    <span className="blue float-right">
                        {teamKills[1]}
                    </span>
                </div>
                {player ?
                    <span>
                        <span className={player.team}>
                            {player.name}
                        </span> as <HeroPortrait class="small" hero={player.hero} /> {player.hero} <br />
                    </span>
                : <br />}
                <Time seconds={this.props.game.time} /> <br />
                {this.props.actions ? 
                <div className="actions">
                    <div className={dropdownCss.join(' ')}>
                        <button type="button" className="dropdown-trigger" onClick={() => this.setState({ menu: !this.state.menu })}>
                            &bull;&bull;&bull;
                        </button>
                        <div className="dropdown-menu">
                            {Object.keys(this.props.actions).map((label, i) => 
                                <a className="dropdown-option" onClick={this.props.actions[label]} key={i}>{label}</a>
                            )}
                        </div>
                    </div>
                </div>
                : null}
                {this.props.tabs ? 
                <ul className="tabs">
                    {Object.keys(this.props.tabs).map((key, i) => 
                        <li key={i} className={this.props.tab == key ? 'active' : ''} onClick={() => this.props.changeTab(key)}><a>{this.props.tabs[key]}</a></li>
                    )}
                </ul> : null}
            </header>
        )
    }
}

module.exports = Header