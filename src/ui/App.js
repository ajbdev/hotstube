const React = require('react')
const SplashScreen = require('./SplashScreen')
const {Config} = require('./Config')
const {Sidebar, SidebarToggle} = require('./Sidebar')
const {BrowserWindow} = require('electron').remote
const GameIndex = require('../lib/GameIndex')
const Game = require('./Game')
const StatusBar = require('./StatusBar')
const PatchNotes = require('./PatchNotes')
const GameRecorder = require('../lib/GameRecorder')
const GameStateWatcher = require('../lib/GameStateWatcher')
const fs = require('fs')
const pathResolver = require('path')
const ConfigOptions = require('../lib/Config')
const HighlightReel = require('../lib/HighlightReel')
const debug = require('../debug')
const GameInProgress = require('./GameInProgress')
const ReplayAnalyzer = require('../lib/ReplayAnalyzer')
const ErrorCheck = require('../lib/ErrorCheck')
const ErrorScreen = require('./ErrorScreen')
const HighlightDir = require('../lib/HighlightDir')
const app = require('electron').remote.app
const ReleaseNotes = require('./ReleaseNotes')
const DownloadNewVersion = require('./DownloadNewVersion')
const dist = require('../lib/Dist.js')


class App extends React.Component {
    constructor() {
        super()

        GameIndex.load()

        this.state = {
            sidebarOpen: false,
            replay: null,
            configWindow: null,
            status: {
                type: 'DiscordTeaser',
                message: ''
            }
        }

        const errorCheck = new ErrorCheck()
        this.state.errors = errorCheck.errors

        let self = this;

        errorCheck.isNewVersionAvailable((result) => {
            if (result) {
                self.setState({ downloadNewVersion: true })
            } else {
                if (fs.existsSync(dist.filename())) {
                    console.log('App up to date. Deleting installer.')
                    fs.unlink(dist.filename(), (err) => {
                        console.log(err)
                    })
                }
            }
        })


        this.indexLoadListener = (index) => {
            
            if (this.state.replay && GameIndex.index.filter((game) => game.name == this.state.replay.name).length === 0) {
                // Make sure loaded replay still exists
                this.setState({ replay: null })
            }
        }

        GameIndex.on('INDEX_LOADED', this.indexLoadListener)

        this.recordingListener = () => {
            this.setState({
                status: {
                    type: null,
                    message: null,
                    loading: true
                }
            })
        }

        GameRecorder.on('RECORDER_START', this.recordingListener)

        this.gameInProgressListener = (file) => {
            this.setState({
                gameInProgress: true,
                sidebarOpen: false
            })
            
            BrowserWindow
                .getAllWindows()[0]
                .setSize(800, 600)
        }

        GameStateWatcher.on('GAME_START', this.gameInProgressListener)

        this.loadGameListener = (file) => {
            const self = this

            // Wait 5 seconds to give highlight reel time to finish up
            setTimeout(() => {
                self.setState({
                    gameInProgress: false,
                }, () => {
                    GameIndex.load()
                    self.loadItem(GameIndex.index[0])
                })
            }, 10000)
        }

        GameStateWatcher.on('GAME_END', this.loadGameListener)
    }
    errorCheck() {
        this.setState({ errors: new ErrorCheck().errors })
    }
    componentDidMount() {
        ConfigOptions.load()
        

        if (GameIndex.index.length > 0 && !ConfigOptions.options.welcomeScreen) {
            this.loadItem(GameIndex.index[0])
        }

        if (ConfigOptions.options.releaseNotes != app.getVersion()) {
            this.setState({ showReleaseNotes: true })
        }
        
        this.pruneWorker = new Worker('./prune_worker.js')
        this.pruneWorker.postMessage([ConfigOptions.options.highlightDir, ConfigOptions.options.highlightLifetimeDays])

        this.pruneOnQuitListener = () => {        
            this.pruneWorker.postMessage([ConfigOptions.options.highlightDir, ConfigOptions.options.highlightLifetimeDays])
        }
        app.on('will-quit', this.pruneOnQuitListener)
    }

    componentWillUnmount() {
        GameIndex.removeListener('INDEX_LOADED', this.indexLoadListener)
        GameStateWatcher.removeListener('GAME_END', this.loadGameListener)
        GameStateWatcher.removeListener('GAME_START', this.gameInProgressListener)
        GameRecorder.removeListener('RECORDER_START', this.recordingListener)
        app.removeListener('will-quit', this.pruneOnQuitListener)
    }
    
    deleteReplay(replay) {
        if (confirm('Are you sure you want to delete this replay? ' +
                    'Replays cannot be recovered once deleted')) {
            fs.unlink(replay.name, (err) => {
                GameIndex.load()
            })
        }
    }
    setStatus(message, options = {}) {
        const type = options.type || null

        if (options.expire) {
            let self = this
            setTimeout(() => {
                self.setState({
                    status: {
                        type: null,
                        message: ''
                    }
                })
            }, parseInt(options.expire))
        }

        this.setState({
            status: {
                type: type,
                message: message
            }
        })
    }
    loadItem(selection) {
        // Clone object so we're not affected by object references
        let item = Object.assign({}, selection)

        if (item.patch) {
            this.setState({
                patch: item,
                showReleaseNotes: false,
                status: {
                    type: null,
                    message: ''
                },
                replay: null
            })
        } else {
            ConfigOptions.load()

            if (item.name) {
                const analyzer = new ReplayAnalyzer(item.name)
                
                try {
                    analyzer.analyze(true)
                    item.game = analyzer.game
                } catch(ex) {
                    // This replay file is corrupt or incomplete
                    console.log('Could not analyze game: ' + ex)
                    item.corrupt = true
                }
    
                const fullPath = ConfigOptions.highlightsSavePath(pathResolver.basename(item.name) + '.webm')
    
                if (fs.existsSync(fullPath)) {
                    try {
                        const reel = new HighlightReel(item.name, fullPath)
                        reel.create(item.accountId, item.heroId)
                    } catch (ex) {
                        console.log('Problem creating highlights: ' + ex)
                    }
                }
            }

            this.setState({
                replay: item,
                showReleaseNotes: false,
                status: {
                    type: null,
                    message: ''
                },
                patch: null
            })
        }

    }

    renderContent() {

        if (this.state.errors.length > 0) {
            return (
                <div>
                    <ErrorScreen 
                        errors={this.state.errors} 
                        configWindow={(win) => this.setState({configWindow: win})} />
                    <Config
                        errorCheck={this.errorCheck.bind(this)}
                        setStatus={this.setStatus.bind(this)}
                        openReleaseNotes={() => this.setState({ showReleaseNotes: true })}
                        window={this.state.configWindow}
                        configWindow={(win) => this.setState({configWindow: win})} />                                 
                </div>
            )
        }

        if (this.state.showReleaseNotes) {
            return (
                <div>
                    <ReleaseNotes showAll={this.state.showReleaseNotes} />
                    <Config
                        errorCheck={this.errorCheck.bind(this)}
                        setStatus={this.setStatus.bind(this)}
                        openReleaseNotes={() => this.setState({ showReleaseNotes: true })}
                        window={this.state.configWindow}
                        configWindow={(win) => this.setState({configWindow: win})} />
                </div>
            )
        }

        if (this.state.gameInProgress) {
            return (<div>
                <StatusBar
                    type={this.state.status.type}
                    message={this.state.status.message}
                    setStatus={this.setStatus.bind(this)}/>
                <GameInProgress />
            </div>
            )
        }

        if (this.state.patch) {
            return (
                <div>
                    <StatusBar
                        type={this.state.status.type}
                        message={this.state.status.message}
                        setStatus={this.setStatus.bind(this)}/>
                    <PatchNotes patch={this.state.patch}/>
                    <Config
                        errorCheck={this.errorCheck.bind(this)}
                        setStatus={this.setStatus.bind(this)}
                        openReleaseNotes={() => this.setState({ showReleaseNotes: true })}
                        window={this.state.configWindow}
                        configWindow={(win) => this.setState({configWindow: win})} />
                </div>
            )
        }

        if (this.state.replay) {
            return (
                <div>
                    <StatusBar
                        type={this.state.status.type}
                        message={this.state.status.message}
                        setStatus={this
                        .setStatus
                        .bind(this)}/>
                    <Game
                        replay={this.state.replay}
                        deleteReplay={this
                        .deleteReplay
                        .bind(this)}
                        setStatus={this
                        .setStatus
                        .bind(this)}/>
                    <Config
                        errorCheck={this.errorCheck.bind(this)}
                        setStatus={this.setStatus.bind(this)}
                        openReleaseNotes={() => this.setState({ showReleaseNotes: true })}
                        window={this.state.configWindow}
                        configWindow={(win) => this.setState({configWindow: win})}/>
                </div>
            )
        }

        return (
            <div>
                <SplashScreen status={this.state.status}/>
                <StatusBar
                    type={this.state.status.type}
                    message={this.state.status.message}
                    setStatus={this.setStatus.bind(this)}/>
                <Config
                    setStatus={this.setStatus.bind(this)}
                    errorCheck={this.errorCheck.bind(this)}
                    openReleaseNotes={() => this.setState({ showReleaseNotes: true })}
                    window={this.state.configWindow}
                    configWindow={(win) => this.setState({configWindow: win})}/>
            </div>
        )
    }

    render() {
        const toggleSidebar = () => {
            this.setState({
                sidebarOpen: !this.state.sidebarOpen
            }, () => {
                BrowserWindow
                    .getAllWindows()[0]
                    .setSize((this.state.sidebarOpen
                        ? 1100
                        : 800), 600)
            })
        }

        return (
            <app>
                {!this.state.gameInProgress && this.state.errors.length === 0 ? <Sidebar
                    open={this.state.sidebarOpen}
                    toggle={toggleSidebar}
                    setStatus={this.setStatus}
                    selectedGame={this.state.replay}
                    loadItem={this
                    .loadItem
                    .bind(this)}
                    configWindow={(win) => this.setState({configWindow: win})}/> 
                    : null}
                <content
                    className={this.state.sidebarOpen
                    ? 'with-sidebar'
                    : ''}>
                    {this.state.downloadNewVersion ? <DownloadNewVersion /> : null}
                    {this.renderContent()}
                </content>
            </app>
        )
    }
}

module.exports = App