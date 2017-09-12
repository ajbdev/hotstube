const React = require('react')
const Uploader = require('./Uploader')
const Time = require('../Time')
const HeroPortrait = require('./HeroPortrait')

class Header extends React.Component {
    constructor(props) {
        super()

        this.state = { menu: false }
    }
    render() {
        const game = this.props.game
        
        const dropdownCss = ['dropdown']
        if (this.state.menu) {
            dropdownCss.push('active')
        }
        
        let deaths = game.scores.filter((s) => s.type == 'Deaths')[0].values
        let teamKills = [0,0]
        game.players.map((p) => {
            teamKills[p.teamId == 0 ? 1 : 0] += deaths[p.playerId-1]
        })
        
        let player = game.players.filter((p) => p.id === this.props.replay.heroId)[0]

        let outcome = {
            'Wins': 'win',
            'Loses': 'loss'
        }[player.outcome]

        return (
            <header>
            {this.state.uploading && this.props.replay ? <Uploader replay={this.props.replay} /> : null}
            <h1>
                {this.props.game.map}
                <span className={"outcome " + outcome}>{outcome}</span>
            </h1>
            <div className="kills">       
                <span className="red">
                    {teamKills[0]}
                </span>
                <span className="blue float-right">
                    {teamKills[1]}
                </span>
            </div>
            <span className={player.team}>
                {player.name}
            </span> as <HeroPortrait class="small" hero={player.hero} /> {player.hero} <br />
            <Time seconds={this.props.game.time} /> <br />
                {this.props.actions ? 
                <div className="actions">
                    <div className={dropdownCss.join(' ')}>
                        <button type="button" className="dropdown-trigger" onClick={() => this.setState({ menu: !this.state.menu })}>
                            &bull;&bull;&bull;
                        </button>
                        <div className="dropdown-menu">
                            {Object.keys(this.props.actions).map((label, i) => 
                                <a onClick={this.props.actions[label]} key={i}>{label}</a>
                            )}
                        </div>
                    </div>
                </div>
                : null}
                {this.props.tabs ? 
                <ul className="tabs">
                    {this.props.tabs.map((tab,i) => 
                        <li key={i} className={this.props.tab == tab ? 'active' : ''} onClick={() => this.props.changeTab(tab)}><a>{tab}</a></li>
                    )}
                </ul> : null}
            </header>
        )
    }
}

module.exports = Header