const React = require('react')
const Svg = require('./Svg')
const GameIndex = require('../../lib/GameIndex')
const ReplayAnalyzer = require('../../lib/ReplayAnalyzer')
const {SidebarRow} = require('./SidebarRow')
const path = require('path')
const ConfigOptions = require('../../lib/Config')
const {List, ArrowKeyStepper} = require('react-virtualized')
const patches = require('../../data/patches.json')
const {remote} = require('electron')
const {app} = remote
const protocolDir = path.join(app.getPath('appData'), 'HotSTube', 'protocols', 'lib')

class Sidebar extends React.Component {
    constructor() {
        super()

        this.analyzeWorker = new Worker('./analyze_worker.js')
        this.analyzeWorker.onmessage = (payload) => {
            let result = payload.data

            if (typeof result === 'string') {
                console.log(result)
                return
            }

            if (result.replay && result.game && !result.error) {
                let replay = GameIndex
                    .index
                    .filter((r) => r.name === result.replay)[0]

                replay.game = result.game

                localStorage.setItem(replay.name, JSON.stringify(replay.game))
                console.log('Saving ' + replay.name)

                this.setState({
                    index: this.index()
                })
            } else if (result.replay && result.error) {
                // Replay is probably corrupt
                let replay = GameIndex
                    .index
                    .filter((r) => r.name === result.replay)[0]

                if (replay) {
                    replay.corrupt = true
                }

                this.setState({
                    index: this.index()
                })
            }
        }

        let self = this

        this.refreshIndexListener = (index) => {
            self.setState({
                index: this.index()
            })
        }

        GameIndex.on('INDEX_LOADED', this.refreshIndexListener)

        this.reloadConfigListener = () => {
            self.setState({
                index: this.index()
            })
        }
        
        ConfigOptions.on('CONFIG_SAVED', this.reloadConfigListener)

        this.state = {
            search: '',
            searching: false,
            sidebarWidth: 300,
            sidebarHeight: 532
        }

        this.state.index = this.index()

        remote.getCurrentWindow().on('resize', this.resizeSidebarListener.bind(this))
    }

    resizeSidebarListener() {
        let height = remote.getCurrentWindow().getSize()[1]
        
        this.setState({
            sidebarHeight: height - 68
        })
    }
    
    componentWillUnmount() {
        GameIndex.removeListener('INDEX_LOADED', this.refreshIndexListener)
        ConfigOptions.removeListener('CONFIG_SAVED', this.reloadConfigListener)
        remote.getCurrentWindow().removeListener(this.resizeSidebarListener)
    }

    index() {
        let index = GameIndex
            .index
            .slice()

        ConfigOptions.load()
        if (ConfigOptions.options.showPatches) {
            patches.map((patch) => {
                index.push({
                    summary: patch.summary,
                    url: patch.url,
                    patch: true,
                    time: (patch.date - 25569) * 86400 * 1000 + ((new Date()).getTimezoneOffset() + (60*12) * 60 * 1000)
                })
            })
        }

        let self = this
        index.map((replay) => {
            if (replay.name && !replay.game) {
                self.loadFromCache(replay.name)
            }
        })

        if (this.state.searching && this.state.search && this.state.search.length > 0) {
            let unindexed = []
            index = index.filter((replay) => {
                if (!replay.name) {
                    return false
                }

                let mapName = path.basename(replay.name, '.StormReplay')

                if (mapName.toLowerCase().indexOf(this.state.search) > -1) {
                    return true
                }

                if (replay.game) {
                    let players = replay
                        .game
                        .players
                        .map((p) => p.name)
                        .join(' ')

                    if (players.toLowerCase().indexOf(this.state.search) > -1) {
                        return true
                    }

                    let hero = replay
                        .game
                        .players
                        .filter((p) => p.id == replay.heroId)
                        .map((p) => p.hero)[0]

                    if (hero && hero.toLowerCase().indexOf(this.state.search) > -1) {
                        return true
                    }
                } else if (!replay.corrupt) {
                    unindexed.push(replay.name)
                }
            })

            if (unindexed.length > 0) {
                index.unshift({unindexed: unindexed})
            }

        }

        return index.sort((a, b) => b.time - a.time)
    }

    renderGameList() {
        return (
            <ArrowKeyStepper columnCount={1} rowCount={this.state.index.length}>
                {({onSectionRendered, scrollToColumn, scrollToRow}) => (<List
                    width={this.state.sidebarWidth}
                    height={this.state.sidebarHeight}
                    rowCount={this.state.index.length}
                    rowHeight={45}
                    rowRenderer={this
                    .rowRenderer
                    .bind(this)}/>)}
            </ArrowKeyStepper>
        )
    }

    handleSearch(query, executeImmediately = false) {
        let self = this

        this.setState({
            search: query,
            searching: query.length > 0
        }, () => {
            if (executeImmediately) {
                self.setState({
                    index: self.index()
                })
            }
        })
    }

    selectItem(item) {
        if (item.patch) {
            this.props.loadItem(item)
            return
        }

        if (item.unindexed) {
            return
        }

        this.props.loadItem(item)
    }

    loadFromCache(file) {
        let game = localStorage.getItem(file)

        if (game) {
            let replay = GameIndex
                .index
                .filter((r) => r.name === file)[0]
            replay.game = JSON.parse(game)
            replay.parsing = false
            return true
        }

        return false
    }

    loadReplay(file, useCache = true) {
        if (useCache) {
            let game = this.loadFromCache()
            if (game) {
                return
            }
        }

        this
            .analyzeWorker
            .postMessage([protocolDir, file])
    }

    rowRenderer({
        index, // Index of row
        isScrolling, // The List is currently being scrolled
        isVisible, // This row is visible within the List (eg it is not an overscanned row)
        key, // Unique key within array of rendered rows
        parent, // Reference to the parent List (instance)
        style // Style object to be applied to row (to position it);
        // This must be passed through to the rendered row element.
    }) {
        const item = this.state.index[index]

        if (item.unindexed) {
            this
                .analyzeWorker
                .postMessage([protocolDir, item.unindexed])
            return (
                <div key={key} style={style} className="omitted-results">
                    Searching for results...
                </div>
            )
        }

        if (!isScrolling && isVisible && !item.game && !item.parsing && !item.patch && item.name) {
            this.loadReplay(item.name)
            item.parsing = true
        }

        return (
            <div key={key} style={style}>
                <SidebarRow
                    item={item}
                    isScrolling={isScrolling}
                    selectItem={this
                    .selectItem
                    .bind(this)}
                    selectedGame={this.props.selectedGame}
                    loadReplay={this
                    .loadReplay
                    .bind(this)}/>
            </div>
        )
    }

    render() {
        if (!this.props.open) {
            return <SidebarToggle toggle={this.props.toggle}/>
        }

        return (
            <sidebar>
                <SidebarSearch
                    configWindow={this.props.configWindow}
                    searching={this.state.searching}
                    search={this.state.search}
                    handleSearch={this
                    .handleSearch
                    .bind(this)}/> {this.renderGameList()}
                <close onClick={this.props.toggle}><Svg src="angle-left.svg"/></close>
            </sidebar>
        )
    }
}

class SidebarSearch extends React.Component {
    handleKeyPress(evt) {
        if (evt.charCode === 13) {
            this
                .props
                .handleSearch(this.props.search, true)
        }
    }

    submit() {
        this
            .props
            .handleSearch(this.props.search, true)
    }

    cancel() {
        this
            .props
            .handleSearch('', true)
    }

    render() {
        let css = ''

        if (this.props.searching) {
            css = 'is-searching'
        }

        return (
            <search>
                <input
                    type="text"
                    placeholder="Search map, hero, or player"
                    value={this.props.search}
                    onChange={(evt) => this.props.handleSearch(evt.target.value)}
                    onKeyPress={this
                    .handleKeyPress
                    .bind(this)}/>
                <Svg
                    className={"cancel " + css}
                    src="times.svg"
                    onClick={this
                    .cancel
                    .bind(this)}/>
                <Svg
                    className={"search " + css}
                    src="search.svg"
                    onClick={this
                    .submit
                    .bind(this)}/>
                <Svg
                    className="filters"
                    src="sliders-h.svg"
                    onClick={() => this.props.configWindow('filters')}/>
            </search>
        )
    }
}

class SidebarToggle extends React.Component {
    constructor() {
        super()
    }
    render() {
        return <sidebar-toggle onClick={this.props.toggle}><Svg src="bars.svg"/></sidebar-toggle>
    }
}

module.exports = {
    Sidebar: Sidebar,
    SidebarToggle: SidebarToggle
}