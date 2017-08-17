const React = require('react')
const Toolbar = require('./Toolbar')
const SplashScreen = require('./SplashScreen')
const Config = require('./Config')
const {Sidebar,SidebarToggle} = require('./Sidebar')
const {BrowserWindow} = require('electron').remote
const GameIndex = require('../lib/GameIndex')
const Game = require('./Game')
const StatusBar = require('./StatusBar')
const PatchNotes = require('./PatchNotes')
const GameRecorder = require('../lib/GameRecorder')

class App extends React.Component {
    constructor() {
        super()
        
        GameIndex.load()
        
        this.state = {
            sidebarOpen: false,
            replay: null,
            status: {
                type: 'DiscordTeaser',
                message: ''
            }
        }

        let self = this
        GameRecorder.on('RECORDER_START', () => {
            self.setState({ 
                status: { type: null, message: null }
            })
        })

        // DEBUGGING CODE BELOW
        const remote = require('electron').remote
        const Menu = remote.Menu
        const MenuItem = remote.MenuItem
        
        let rightClickPosition = null
        
        const menu = new Menu()
        const menuItem = new MenuItem({
          label: 'Inspect Element',
          click: () => {
            remote.getCurrentWindow().inspectElement(rightClickPosition.x, rightClickPosition.y)
          }
        })
        menu.append(menuItem)
        
        window.addEventListener('contextmenu', (e) => {
          e.preventDefault()
          rightClickPosition = {x: e.x, y: e.y}
          menu.popup(remote.getCurrentWindow())
        }, false)
    }
    setStatus(message, options = {}) {
        const type = options.type || null

        if (options.expire) {
            let self = this
            setTimeout(() => {
                self.setState({ 
                    status: { type: null, message: '' }
                })
            }, parseInt(options.expire))
        }

        this.setState({ 
            status: { type: type, message: message }
        })
    }
    loadItem(item) {
        if (item.patch) {
            this.setState({
                patch: item,
                status: { type: null, message: ''},
                replay: null
            })
        } else {
            this.setState({
                replay: item,
                status: { type: null, message: ''},
                patch: null
            })
        }
        
    }

    renderContent() {
        if (this.state.patch) {
            return (
                <div>
                    <StatusBar type={this.state.status.type} message={this.state.status.message} setStatus={this.setStatus.bind(this)} />
                    <PatchNotes patch={this.state.patch} />
                    <Config setStatus={this.setStatus.bind(this)} />
                </div>
            )
        }

        if (this.state.replay) {
            return (
                <div>
                    <StatusBar type={this.state.status.type} message={this.state.status.message} setStatus={this.setStatus.bind(this)} />
                    <Game replay={this.state.replay} />
                    <Config setStatus={this.setStatus.bind(this)} />
                </div>
            )
        }

        return (
            <div>
                <SplashScreen status={this.state.status} />
                <StatusBar type={this.state.status.type} message={this.state.status.message} setStatus={this.setStatus.bind(this)} />
                <Config setStatus={this.setStatus.bind(this)} />
            </div>
        )
    }

    render() {
        const toggleSidebar = () => {
            this.setState({ sidebarOpen: !this.state.sidebarOpen }, () => {
                BrowserWindow.getAllWindows()[0].setSize( (this.state.sidebarOpen ? 1100 : 800), 600)
            })
        }

        return (
            <app>
                <Sidebar open={this.state.sidebarOpen} toggle={toggleSidebar} setStatus={this.setStatus} selectedGame={this.state.replay} loadItem={this.loadItem.bind(this)} />
                <content className={this.state.sidebarOpen ?  'with-sidebar': ''}>
                    {this.renderContent()}
                </content>
            </app>
        )
    }
}

module.exports = App