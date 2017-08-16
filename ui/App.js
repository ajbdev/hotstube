const React = require('react')
const Toolbar = require('./Toolbar')
const SplashScreen = require('./SplashScreen')
const Config = require('./Config')
const {Sidebar,SidebarToggle} = require('./Sidebar')
const {BrowserWindow} = require('electron').remote
const GameIndex = require('../lib/GameIndex')
const Game = require('./Game')
const PatchNotes = require('./PatchNotes')

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
                replay: null
            })
        } else {
            this.setState({
                replay: item,
                patch: null
            })
        }
        
    }

    renderContent() {
        if (this.state.patch) {
            return <PatchNotes patch={this.state.patch} />
        }

        if (this.state.replay) {
            return <Game replay={this.state.replay} />
        }

        return (
            <div>
                <SplashScreen status={this.state.status} />
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