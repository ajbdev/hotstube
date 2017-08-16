const React = require('react')
const Svg = require('./Svg')
const GameIndex = require('../lib/GameIndex')
const ReplayAnalyzer = require('../lib/ReplayAnalyzer')
const path = require('path')
const { List, ArrowKeyStepper } = require('react-virtualized')
const moment = require('moment')

class Sidebar extends React.Component {
    constructor() {
        super()

        this.analyzeWorker = new Worker('./analyze_worker.js')
        this.analyzeWorker.onmessage = (payload) => {
            let result = payload.data

            if (typeof result == 'object' && result.replay && result.game) {
                let replay = GameIndex.index.filter((r) => r.name === result.replay)[0]

                replay.game = result.game

                localStorage.setItem(replay.name, JSON.stringify(replay.game))

                this.setState({ index: GameIndex.index })
            } else {
                console.log(result)
                // Replay is probably corrupt
            }
        }

        this.state = { index: GameIndex.index }
    }


    renderGameList() {
        return  (
            <ArrowKeyStepper columnCount={1} rowCount={this.state.index.length}>
                {({ onSectionRendered, scrollToColumn, scrollToRow }) => (
                <List
                    width={300}
                    height={450}
                    rowCount={this.state.index.length}
                    rowHeight={45}
                    rowRenderer={this.rowRenderer.bind(this)}
                />
                )}
            </ArrowKeyStepper>
        )
    }

    loadReplay(file) {
        let game = localStorage.getItem(file)

        if (game) {
            let replay = GameIndex.index.filter((r) => r.name === file)[0]
            replay.game = JSON.parse(game)
            replay.parsing = false
            return
        }

        this.analyzeWorker.postMessage(file)
    }

    rowRenderer({
        index,       // Index of row
        isScrolling, // The List is currently being scrolled
        isVisible,   // This row is visible within the List (eg it is not an overscanned row)
        key,         // Unique key within array of rendered rows
        parent,      // Reference to the parent List (instance)
        style        // Style object to be applied to row (to position it);
                     // This must be passed through to the rendered row element.
        }) {
            const replay = this.state.index[index]

            if (!isScrolling && isVisible && !replay.game && !replay.parsing) {
                this.loadReplay(replay.name)
                replay.parsing = true
            }

            return (
                <div key={key} style={style}>
                    <SidebarRow replay={replay} isScrolling={isScrolling} loadReplay={this.loadReplay.bind(this)} />
                </div>
            )
    }

    render() {
        if (!this.props.open) {
            return <SidebarToggle toggle={this.props.toggle} />
        }

        return (
            <sidebar>
                {this.renderGameList()}
                <close onClick={this.props.toggle}><Svg src="times.svg" /></close>
            </sidebar>
        )
    }
}

class SidebarRow extends React.Component {
    constructor() {
        super()
    }
    render() {
        let replay = this.props.replay;

        let name = path.basename(replay.name,'.StormReplay')
        let nameParts = name.match(/(.*)\(\d+\)/)

        if (nameParts && nameParts.length > 0) {
            name = nameParts[1]
        }

        let date = moment(replay.time)
        let now = moment()
        let dateDisplay = date.fromNow()

        if (now.diff(date,'days') > 2) {
            dateDisplay = date.format('l')
        }   

        let attrs = {}

        if (replay.game) {
            let player = replay.game.players.filter((p) => p.id == replay.heroId)[0]

            attrs.hero = player.hero;
        }

        return (
            <sidebar-row onClick={() => this.props.loadReplay(replay.name)}>
                <SidebarHeroPortrait {...attrs} />
                <a>{name}</a>
                <div className="date">{dateDisplay}</div>
            </sidebar-row>
        )
    }
}

class SidebarHeroPortrait extends React.Component {
    style() {
        if (this.props.hero) {
            let file = this.props.hero.toLowerCase().replace(/[\W]+/g,"");
            let src = './assets/heroes/'+ file + '.png'

            return {
                backgroundImage: 'url("' + src + '")'
            }
        }

        return {}
    }

    render() {
        return <hero-portrait style={this.style()}></hero-portrait>
    }
}

class SidebarToggle extends React.Component {
    constructor() {
        super()
    }
    render() {
        return <sidebar-toggle onClick={this.props.toggle}><Svg src="bars.svg" /></sidebar-toggle>
    }
}

module.exports = {
    Sidebar: Sidebar,
    SidebarToggle: SidebarToggle,
    SidebarGameRow: SidebarRow
}