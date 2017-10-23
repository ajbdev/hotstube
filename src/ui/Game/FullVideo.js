const React = require('react')
const Time = require('../Time')
const HeroPortrait = require('./HeroPortrait')
const Players = require('../../lib/Players')
const fs = require('fs')
const GameTimeline = require('../../lib/GameTimeline')

class FullVideo extends React.Component {
    constructor(props) {
        super()
        
        this.state = { playing: false, video: null }

        this.trackerCursor = null
        this.videoBinded = false
        this.bufferedVideo = null
    }

    bindVideoEvents() {
        this.video.onplaying = () => {
            this.setState({ playing: true })
        }

        let stop = () => {
            this.setState({ playing: false })
        }

        this.video.onended = stop
        this.video.onpause = stop

        this.videoBinded = true

        this.trackerCursor = setInterval(this.updateCursor.bind(this), 1000)
    }
    updateCursor() {
        if (!this.video  || !this.cursor) {
            return
        }

        const rect = this.tracker.getBoundingClientRect()
        const max = rect.width
        const scale = max / this.video.duration

        let time = this.video.currentTime 

        this.cursor.style.left = parseInt(time * scale) + 'px'
    }
    toggleVideo() {
        if (!this.videoBinded) {
            this.bindVideoEvents()
        }

        let action = this.state.playing ? 'pause' : 'play'

        this.video[action]()
    }

    componentWillUnmount() {
        clearInterval(this.trackerCursor)
        this.video.onended = null
        this.video.onpause = null
        this.video.onplaying = null
        this.trackerCursor = null
        this.video.pause()
    }

    componentDidMount() {
        fs.readFile(this.props.replay.game.video, (err, data) => {
            let buffer = new Buffer(data)
            let arrayBuffer = new Uint8Array(buffer).buffer
            let blob = new Blob([arrayBuffer])
            let url = URL.createObjectURL(blob)

            this.setState({
                video: url
            })
        })
    }

    seek(evt) {
        const rect = this.tracker.getBoundingClientRect()
        const target = evt.clientX - rect.left
        const max = rect.width
        const scale = this.video.duration / max
        const seekTo = target * scale
        
        this.video.currentTime = seekTo

        this.updateCursor()
    }

    eventStyle(event) {
        if (!this.tracker) {
            return {}
        }

        const rect = this.tracker.getBoundingClientRect()
        const max = rect.width
        const scale = max / this.video.duration
        const placement = event.time * scale

        return {
            left: parseInt(placement) + 'px'
        }
    }

    renderTracker() {
        const timeline = new GameTimeline(this.props.game).generate()
        const players = new Players(this.props.game.players)

        return (
            <tracker onClick={this.seek.bind(this)} ref={(tracker) => { this.tracker = tracker }}>
                <cursor ref={(cursor) => { this.cursor = cursor }} />
                {timeline.map((event) => 
                    <marker key={event.time} style={this.eventStyle(event)}></marker>
                )}
            </tracker>
        )
    }

    render() {

        return (
            <tab-content>
                <full-video>
                    <div className="screen" onClick={this.toggleVideo.bind(this)}>
                        {!this.state.playing ? <video-controls></video-controls> : null}
                        <video src={this.state.video} ref={(video) => { this.video = video }} />
                    </div>               
                    {this.renderTracker()}     
                </full-video>
            </tab-content>
        )
    }
}


module.exports = FullVideo