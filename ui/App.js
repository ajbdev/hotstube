const React = require('react')
const Toolbar = require('./Toolbar')
const SplashScreen = require('./SplashScreen')
const Config = require('./Config')
const {Sidebar,SidebarToggle} = require('./Sidebar')
const {BrowserWindow} = require('electron').remote
const GameIndex = require('../lib/GameIndex')


class App extends React.Component {
    constructor() {
        super()
        
        GameIndex.load()
        
        this.state = {
            sidebarOpen: false,
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
    render() {
        const toggleSidebar = () => {
            this.setState({ sidebarOpen: !this.state.sidebarOpen }, () => {
                BrowserWindow.getAllWindows()[0].setSize( (this.state.sidebarOpen ? 940 : 640), 480)
            })
        }

        return (
            <app>
                <Sidebar open={this.state.sidebarOpen} toggle={toggleSidebar} setStatus={this.setStatus} />
                <content className={this.state.sidebarOpen ?  'with-sidebar': ''}>
                    <SplashScreen status={this.state.status} />
                    <Config setStatus={this.setStatus.bind(this)}  />
                </content>
            </app>
        )
    }
}

module.exports = App