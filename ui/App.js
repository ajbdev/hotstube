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
            sidebarOpen: false
        }
    }
    render() {
        const toggleSidebar = () => {
            this.setState({ sidebarOpen: !this.state.sidebarOpen }, () => {
                BrowserWindow.getAllWindows()[0].setSize( (this.state.sidebarOpen ? 940 : 640), 480)
            })
        }

        return (
            <app>
                <Sidebar open={this.state.sidebarOpen} toggle={toggleSidebar} />
                <content className={this.state.sidebarOpen ?  'with-sidebar': ''}>
                    <SplashScreen />
                    <Config />
                </content>
            </app>
        )
    }
}

module.exports = App