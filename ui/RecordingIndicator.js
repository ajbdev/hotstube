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
            }, () => {
                self.props.setStatus('Recording finished')
            })
        })
    }

    render() {
        return (
            <recording-indicator>
                {this.state.isRecording ?
                    <is-recording><recording-dot /> Recording</is-recording> : null
                }
                {!this.state.isRecording && !this.props.hideNotRecording ? 
                    <stopped-recording><Svg src="video.svg" /> Not recording</stopped-recording> : null
                }
            </recording-indicator>
        )
    }
}

module.exports = RecordingIndicator