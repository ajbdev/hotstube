const React = require('react')
const SplashScreen = require('./App/SplashScreen')
const {Config} = require('./App/Config')
const {Sidebar, SidebarToggle} = require('./App/Sidebar')
const {BrowserWindow} = require('electron').remote
const GameIndex = require('../lib/GameIndex')
const GameHash = require('../lib/GameHash')
const Game = require('./App/Game')
const PatchNotes = require('./App/PatchNotes')
const GameRecorder = require('../lib/GameRecorder')
const GameStateWatcher = require('../lib/GameStateWatcher')
const fs = require('fs')
const pathResolver = require('path')
const ConfigOptions = require('../lib/Config')
const HighlightReel = require('../lib/HighlightReel')
const debug = require('../debug')
const GameInProgress = require('./App/GameInProgress')
const ReplayAnalyzer = require('../lib/ReplayAnalyzer')
const ErrorCheck = require('../lib/ErrorCheck')
const ErrorScreen = require('./App/ErrorScreen')
const HighlightDir = require('../lib/HighlightDir')
const app = require('electron').remote.app
const ReleaseNotes = require('./App/ReleaseNotes')
const DownloadNewVersion = require('./App/DownloadNewVersion')
const dist = require('../lib/Dist.js')
const glob = require('glob')
const UpdateHeroProtocol = require('./../lib/UpdateHeroProtocol')
const {ProtocolError} = require('../lib/HeroProtocol')
const HeroesPatchNotes = require('../lib/HeroesPatchNotes')

class App extends React.Component {
    constructor() {
        super()

        GameIndex.load()

        this.state = {
            sidebarOpen: false,
            replay: null,
            configWindow: null
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
                recording: true
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
            if (!this.state.recording) {
                this.setState({
                    gameInProgress: false,
                }, () => {
                    GameIndex.load()
                    this.loadItem(GameIndex.index[0])
                })
            }
        }

        this.recordingEndListener = (video) => {
            this.setState({
                recording: false
            }, () => {
                this.loadGameListener(video)
            })
        }

        GameRecorder.on('VIDEO_SAVED', this.recordingEndListener)

        GameStateWatcher.on('GAME_END', this.loadGameListener)
    }
    errorCheck() {
        this.setState({ errors: new ErrorCheck().errors })
    }
    componentDidMount() {
        if (GameIndex.index.length > 0 && !ConfigOptions.options.welcomeScreen) {
            this.loadItem(GameIndex.index[0])
        }

        if (ConfigOptions.options.releaseNotes != app.getVersion()) {
            this.setState({ showReleaseNotes: true })
        }
        
        if (!fs.existsSync(HeroesPatchNotes.path)) {
            HeroesPatchNotes.downloadRepository()
        } else {
            HeroesPatchNotes.checkAndDownload()
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
        GameRecorder.removeListener('VIDEO_SAVED',this.recordingEndListener)
        app.removeListener('will-quit', this.pruneOnQuitListener)
    }
    deleteVideo(evt) {
        evt.stopPropagation()
        
        return new Promise((resolve, reject) => {
            if (!confirm('Are you sure you want to delete the video for this game?')) {
                return resolve()
            }
            if (!this.state.replay.game.video) {
                return reject('No video to delete')
            }

            fs.unlink(this.state.replay.game.video, (err) => { 
                delete this.state.replay.game.video
                this.loadItem(this.state.replay)
                return resolve()
            })
        })
    }
    deleteReplay(replay) {
        if (confirm('Are you sure you want to delete this replay? ' +
                    'Replays cannot be recovered once deleted')) {
            fs.unlink(replay.name, (err) => {
                GameIndex.load()
            })
        }
    }
    loadItem(selection) {
        // Clone object so we're not affected by object references
        let item = Object.assign({}, selection)

        if (item.patch) {
            this.setState({
                patch: item,
                showReleaseNotes: false,
                replay: null
            })
        } else {
            ConfigOptions.load()

            if (item.name) {
                const analyzer = new ReplayAnalyzer(item.name)

                try {
                    analyzer.analyze(true)
                    console.log(analyzer)
                    item.game = analyzer.game    

                    if (item.game) {
                        const hash = GameHash.hash(item.game)
                        const videoPath = ConfigOptions.highlightsSavePath(pathResolver.basename(item.name) + '-' + hash + '.webm')

                        if (fs.existsSync(videoPath)) {
                            item.game.video = videoPath
                        } 
                        item.game.highlights = HighlightReel.getHighlights(item.accountId, item.heroId, pathResolver.basename(item.name,'.StormReplay'), hash)

                        if (item.game.video && (!item.game.highlights || Object.keys(item.game.highlights).length == 0)) { 
                            try {
                                const reel = new HighlightReel(item.name, videoPath)
                                item.game.highlights = reel.create(item.accountId, item.heroId)
                                this.forceUpdate()
                            } catch (ex) {
                                console.log('Problem creating highlights: ' + ex)
                            }
                        }
                    }
                } catch(ex) {
                    if (ex instanceof ProtocolError) {
                        if (ex.type == 'PROTOCOL_MISSING') {
                            item.updatingProtocols = true
                            UpdateHeroProtocol.download().then(() => {
                                item.updatingProtocols = false

                                this.loadItem(item)
                            })
                        } else if (ex.type == 'INVALID_REPLAY' || ex.type == 'REPLAY_NOT_FOUND') {
                            item.corrupt = true
                        }
                    } else {
                        // This replay file is corrupt or incomplete
                        console.log('Could not analyze game: ' + ex)
                        console.log(ex.stack)
                        item.corrupt = true
                    }
                }

                localStorage.setItem(item.name, JSON.stringify(item.game))
            }

            this.setState({
                replay: item,
                showReleaseNotes: false,
                patch: null
            })
        }

    }

    renderContent() {

        if (this.state.errors.length > 0) {
            return (
                <div>
                    {!this.state.configWindow ? <ErrorScreen 
                        errors={this.state.errors} 
                        configWindow={(win) => this.setState({configWindow: win})} /> : null}
                    <Config
                        errorCheck={this.errorCheck.bind(this)}
                        openReleaseNotes={() => this.setState({ showReleaseNotes: true })}
                        window={this.state.configWindow}
                        configWindow={(win) => this.setState({configWindow: win})} />                                 
                </div>
            )
        }

        if (this.state.showReleaseNotes) {
            return (
                <div>
                    {!this.state.configWindow ? <ReleaseNotes showAll={this.state.showReleaseNotes} /> : null}
                    <Config
                        errorCheck={this.errorCheck.bind(this)}
                        openReleaseNotes={() => this.setState({ showReleaseNotes: true })}
                        window={this.state.configWindow}
                        configWindow={(win) => this.setState({configWindow: win})} />
                </div>
            )
        }

        if (this.state.gameInProgress) {
            return (<div>
                <GameInProgress />
            </div>
            )
        }

        if (this.state.patch) {
            return (
                <div>
                    {!this.state.configWindow ? <PatchNotes patch={this.state.patch}/> : null}
                    <Config
                        errorCheck={this.errorCheck.bind(this)}
                        openReleaseNotes={() => this.setState({ showReleaseNotes: true })}
                        window={this.state.configWindow}
                        configWindow={(win) => this.setState({configWindow: win})} />
                </div>
            )
        }

        if (this.state.replay) {
            return (
                <div>
                    {!this.state.configWindow ? <Game
                        replay={this.state.replay}
                        deleteVideo={this.deleteVideo.bind(this)}
                        deleteReplay={this.deleteReplay.bind(this)} /> 
                        : null}
                    <Config
                        errorCheck={this.errorCheck.bind(this)}
                        openReleaseNotes={() => this.setState({ showReleaseNotes: true })}
                        window={this.state.configWindow}
                        configWindow={(win) => this.setState({configWindow: win})}/>
                </div>
            )
        }

        return (
            <div>
                {!this.state.configWindow ? <SplashScreen /> : null}
                <Config
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