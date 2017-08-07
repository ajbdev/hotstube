const React = require('react')
const Toolbar = require('./Toolbar')
const SplashScreen = require('./SplashScreen')

class App extends React.Component {
    render() {
        return (
            <app>
                <Toolbar></Toolbar>
                <SplashScreen />
            </app>
        )
    }
}

module.exports = App