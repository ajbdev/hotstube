const React = require('react')

const GameRecorder = require('../../lib/GameRecorder')
const Svg = require('./Svg')

class RecordingIndicator extends React.Component {
    constructor() {
        super()

        this.state = {
            isRecording: false
        }

        let self = this;


        this.recordingFinishedListener =  () => {
            self.setState({ 
                isRecording: false 
            }, () => {
                self.props.setStatus('Recording finished')
            })
        }

        this.recordingStartedListener = () => {
            self.setState({ 
                isRecording: true 
            })
        }
        GameRecorder.on('RECORDER_START', this.recordingStartedListener)
                    .on('RECORDER_END',this.recordingFinishedListener)
    }
    
    componentWillUnmount() {
        GameRecorder.removeListener('RECORDER_START', this.recordingStartedListener)
        GameRecorder.removeListener('RECORDER_END', this.recordingFinishedListener)
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