const React = require('react')
const Toolbar = require('./Toolbar')
const SplashScreen = require('./SplashScreen')
const {Config} = require('./Config')
const {Sidebar, SidebarToggle} = require('./Sidebar')
const {BrowserWindow} = require('electron').remote
const GameIndex = require('../lib/GameIndex')
const Game = require('./Game')
const StatusBar = require('./StatusBar')
const PatchNotes = require('./PatchNotes')
const GameRecorder = require('../lib/GameRecorder')
const fs = require('fs')
const pathResolver = require('path')
const ConfigOptions = require('../lib/Config')
const HighlightReel = require('../lib/HighlightReel')
const debug = require('../debug')

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

        GameIndex.on('INDEX_LOADED', (index) => {
            if (this.state.replay && GameIndex.index.filter((game) => game.name == this.state.replay.name).length === 0) {
                // Make sure loaded replay still exists
                self.setState({replay: null})
            }
        })

        let self = this
        GameRecorder.on('RECORDER_START', () => {
            self.setState({
                status: {
                    type: null,
                    message: null
                }
            })
        })

    }
    deleteReplay(replay) {
        if (confirm('Are you sure you want to delete this replay? Replays cannot be recovered once de' +
                'leted')) {
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
    loadItem(item) {
        if (item.patch) {
            this.setState({
                patch: item,
                status: {
                    type: null,
                    message: ''
                },
                replay: null
            })
        } else {
            ConfigOptions.load()

            const fullPath = ConfigOptions.highlightsSavePath(pathResolver.basename(item.name) + '.webm')

            if (fs.existsSync(fullPath)) {
                try {
                    const reel = new HighlightReel(item.name, fullPath)
                    reel.create(item.accountId, item.heroId)
                } catch (ex) {
                    console.log('Problem creating highlights: ' + ex)
                }
            }
            this.setState({
                replay: item,
                status: {
                    type: null,
                    message: ''
                },
                patch: null
            })
        }

    }

    renderContent() {
        if (this.state.patch) {
            return (
                <div>
                    <StatusBar
                        type={this.state.status.type}
                        message={this.state.status.message}
                        setStatus={this
                        .setStatus
                        .bind(this)}/>
                    <PatchNotes patch={this.state.patch}/>
                    <Config
                        setStatus={this
                        .setStatus
                        .bind(this)}
                        window={this.state.configWindow}
                        configWindow={(win) => this.setState({configWindow: win})}/>
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
                        setStatus={this
                        .setStatus
                        .bind(this)}
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
                    setStatus={this
                    .setStatus
                    .bind(this)}/>
                <Config
                    setStatus={this
                    .setStatus
                    .bind(this)}
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
                <Sidebar
                    open={this.state.sidebarOpen}
                    toggle={toggleSidebar}
                    setStatus={this.setStatus}
                    selectedGame={this.state.replay}
                    loadItem={this
                    .loadItem
                    .bind(this)}
                    configWindow={(win) => this.setState({configWindow: win})}/>
                <content
                    className={this.state.sidebarOpen
                    ? 'with-sidebar'
                    : ''}>
                    {this.renderContent()}
                </content>
            </app>
        )
    }
}

module.exports = App