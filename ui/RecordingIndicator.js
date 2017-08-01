import React from 'react'
import styles from '../style/recording-indicator.css'
import Camera from '-!svg-react-loader!../svg/video.svg'
const GameStateWatcher = require('../lib/GameStateWatcher')

export class RecordingIndicator extends React.Component {
    isRecording() {
        return false
    }
    render() {
        return (
            <recording-indicator>
                {this.isRecording() ?
                    <is-recording><recording-dot /> Recording</is-recording> :
                    <stopped-recording><Camera /> Not recording</stopped-recording>
                }
            </recording-indicator>
        )
    }
}
