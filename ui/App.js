const React = require('react')
const Toolbar = require('./Toolbar')
const SplashScreen = require('./SplashScreen')
const Config = require('./Config')

class App extends React.Component {
    render() {
        return (
            <app>
                <SplashScreen />
                <Config />
            </app>
        )
    }
}

module.exports = App