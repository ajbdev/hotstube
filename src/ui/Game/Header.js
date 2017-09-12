const React = require('react')
const Uploader = require('./Game/Uploader')
const Time = require('./Time')

class Header extends React.Component {
    constructor(props) {
        super()
    }
    render() {


        let outcome = this.props.player.outcome == 'Win' ? 'win' : 'loss'

        const game = this.props.game
        
        let player = game.players.filter((p) => p.id === this.props.replay.heroId)[0]

        return (
            <header>
            {this.state.uploading && this.props.replay ? <Uploader replay={this.props.replay} /> : null}
            <h1>
                {this.props.game.map}
                <span className={"outcome " + this.props.outcome}>{this.props.outcome}</span>
            </h1>
            <div className="kills">       
                <span className="red">
                    {this.props.teamKills[0]}
                </span>
                <span className="blue float-right">
                    {this.props.teamKills[1]}
                </span>
            </div>
            <span className={this.props.player.team}>
                {this.props.player.name}
            </span> as <HeroPortrait class="small" hero={this.props.player.hero} /> {this.props.player.hero} <br />
            <Time seconds={this.props.game.time} /> <br />
            <div className="actions">
                <div className={dropdownCss.join(' ')}>
                    <button type="button" className="dropdown-trigger" onClick={() => this.setState({ menu: !this.state.menu })}>
                        &bull;&bull;&bull;
                    </button>
                    <div className="dropdown-menu">
                        <a onClick={() => this.setState({ uploading: true })}>Upload Game</a>
                        <a onClick={this.export.bind(this)}>Export data</a>
                        <a onClick={() => this.props.deleteReplay(this.props.replay)}>Delete replay</a>
                    </div>
                </div>
            </div>
                {this.props.tabs ? 
                <ul className="tabs">
                    {this.props.tabs.map((tab,i) => 
                        <li key={i} className={this.state.tab == tab ? 'active' : ''} onClick={() => changeTab(tab)}><a>{tab}</a></li>
                    )}
                </ul> : null}
            </header>
        )
    }
}

module.exports = Header