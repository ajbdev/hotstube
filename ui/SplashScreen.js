const React = require('react')
const RecordingIndicator = require('./RecordingIndicator')
const Svg = require('./Svg')
const StatusBar = require('./StatusBar')

class SplashScreen extends React.Component {
    render() {
        return (
            <splash-screen>
                <Svg src="logo.svg" className="logo" />
                <video-toolbar>
                    <RecordingIndicator></RecordingIndicator>
                </video-toolbar>
                <StatusBar type={this.props.status.type} message={this.props.status.message} />
            </splash-screen>
        )
    }
}

module.exports = SplashScreen