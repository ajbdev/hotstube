const React = require('react')
const Svg = require('./Svg')
const StatusBar = require('./StatusBar')

class SplashScreen extends React.Component {
    render() {
        return (
            <splash-screen>
                <Svg src="logo.svg" className="logo" />
            </splash-screen>
        )
    }
}

module.exports = SplashScreen