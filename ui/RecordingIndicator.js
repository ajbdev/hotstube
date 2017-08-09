const React = require('React')

const GameRecorder = require('../lib/GameRecorder')
const Svg = require('./Svg')

class RecordingIndicator extends React.Component {
    constructor() {
        super()

        this.state = {
            isRecording: false
        }
    }
    componentDidMount() {
        let self = this;

        GameRecorder.on('RECORDER_START', () => {
            self.setState({ 
                isRecording: true 
            })
        }).on('RECORDER_END', () => {
            self.setState({ 
                isRecording: false 
            })
        })
    }

    render() {
        return (
            <recording-indicator>
                {this.state.isRecording ?
                    <is-recording><recording-dot /> Recording</is-recording> :
                    <stopped-recording><Svg src="video.svg" /> Not recording</stopped-recording>
                }
            </recording-indicator>
        )
    }
}

module.exports = RecordingIndicator