const React = require('react')
const Svg = require('./Svg')
const GameIndex = require('../lib/GameIndex')
const ReplayAnalyzer = require('../lib/ReplayAnalyzer')
const { SidebarRow } = require('./SidebarRow')
const path = require('path')
const { List, ArrowKeyStepper } = require('react-virtualized')
const patches = require('../patches.json')

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

                this.setState({ index: this.index() })
            } else {
                console.log(result)
                // Replay is probably corrupt
            }
        }

        this.state = { index: this.index() }
    }

    index() {
        const index = GameIndex.index.slice()

        patches.map((patch) => {
            index.push({
                summary: patch.summary,
                url: patch.url,
                patch: true,
                time:  (patch.date - 25569) * 86400 * 1000
            })
        })

        return index.sort((a,b) => b.time - a.time)
    }


    renderGameList() {
        return  (
            <ArrowKeyStepper columnCount={1} rowCount={this.state.index.length}>
                {({ onSectionRendered, scrollToColumn, scrollToRow }) => (
                <List
                    width={300}
                    height={570}
                    rowCount={this.state.index.length}
                    rowHeight={45}
                    rowRenderer={this.rowRenderer.bind(this)}
                />
                )}
            </ArrowKeyStepper>
        )
    }

    selectItem(item) {
        if (item.patch) {
            this.props.loadItem(item)
            return
        }
        
        this.loadReplay(item.name, false)

        this.props.loadItem(item)
    }

    loadReplay(file, useCache = true) {
        let game = localStorage.getItem(file)

        if (game && useCache) {
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
            const item = this.state.index[index]

            if (!isScrolling && isVisible && !item.game && !item.parsing && !item.patch) {
                this.loadReplay(item.name)
                item.parsing = true
            }

            return (
                <div key={key} style={style}>
                    <SidebarRow item={item} isScrolling={isScrolling} selectItem={this.selectItem.bind(this)} selectedGame={this.props.selectedGame} loadReplay={this.loadReplay.bind(this)} />
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
                <close onClick={this.props.toggle}><Svg src="angle-left.svg" /></close>
            </sidebar>
        )
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
    SidebarToggle: SidebarToggle
}