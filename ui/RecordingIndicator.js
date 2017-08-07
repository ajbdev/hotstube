const React = require('React')

//const GameStateWatcher = require('../lib/GameStateWatcher')
const Svg = require('./Svg')

class RecordingIndicator extends React.Component {
    constructor() {
        super()

        this.isRecording = false
    }
    // componentDidMount() {
    //     let self = this;

    //     const gameWatcher = new GameStateWatcher()

    //     gameWatcher.watch().on('GAME_START', () => {
    //         self.isRecording = true
    //     }).on('GAME_END', () => {
    //         self.isRecording = false
    //     })
    // }
    render() {
        return (
            <recording-indicator>
                {this.isRecording ?
                    <is-recording><recording-dot /> Recording</is-recording> :
                    <stopped-recording><Svg src="video.svg" /> Not recording</stopped-recording>
                }
            </recording-indicator>
        )
    }
}

module.exports = RecordingIndicator