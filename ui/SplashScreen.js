const React = require('react')
const RecordingIndicator = require('./RecordingIndicator')
const Svg = require('./Svg')

class SplashScreen extends React.Component {
    render() {
        return (
            <splash-screen>
                <Svg src="logo.svg" className="logo" />
                <video-toolbar>
                    <RecordingIndicator></RecordingIndicator>
                </video-toolbar>
            </splash-screen>
        )
    }
}

module.exports = SplashScreen