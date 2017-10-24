const React = require('react')
const Time = require('../Time')
const HeroPortrait = require('./HeroPortrait')
const fs = require('fs')
const GameTimeline = require('../../lib/GameTimeline')
const Players = require('../../lib/Players')
const {KDATable} = require('./Highlights')
const {Timeline,TimelineEvent} = require('./Timeline')
const Config = require('../../lib/Config')

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

        this.forceUpdate()
    }

    toggleVideo() {
        if (!this.videoBinded) {
            this.bindVideoEvents()
        }

        let action = this.state.playing ? 'pause' : 'play'

        this.video[action]()
    }

    componentWillReceiveProps(props) {
        this.players = new Players(props.game.players)
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
        fs.readFile(this.props.game.video, (err, data) => {
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

    markerPlacement(event) {
        if (!this.tracker) {
            return {}
        }
        const rect = this.tracker.getBoundingClientRect()
        const max = rect.width
        const scale = max / this.video.duration
        const placement = this.slideFactor(event.time) * scale

        const style = {
            left: parseInt(placement) + 'px'
        }

        if (event.active) {
            style.opacity = '1.0'
        }

        return style
    }

    slideFactor(at) {
        return at + ((-0.016*at)+8.2)
    }

    markerFill(kill, ix, total) {
        const victim = this.players.find(kill.victim)
        const classes = ['fill']

        classes.push(victim.team == 'blue' ? 'red' : 'blue')

        const style = {
            height: (30 / total) + 'px',
            top: (30 / total * ix) + 'px'
        }

        return <div className={classes.join(' ')} key={ix} style={style} />
    }

    marker(event) {
        if (event.type !== 'fight' || !this.tracker) {
            return null
        }

        return (
            <marker key={event.time} style={this.markerPlacement(event)}>
                {event.data.kills.map((kill, ix) => 
                    this.markerFill(kill, ix, event.data.kills.length)
                )}
            </marker>
        )
    }

    time(seconds) {
        return ~~(seconds / 60) + ':' + (seconds % 60 < 10 ? "0" : "") + Math.floor(seconds % 60)
    }

    markActiveEvent(timeline) {

        this.activeEvent = null

        let currentTime = this.slideFactor(this.video.currentTime)


        timeline.map((event) => {
            event.active = false

            if (currentTime > this.slideFactor(event.time)) {
                this.activeEvent = event

                if (event.data.kills) {
                    let lastKill = event.data.kills[event.data.kills.length-1]

                    if (this.slideFactor(lastKill.time) < currentTime) {
                        this.activeEvent = null
                    }
                }
            }
        })

        if (this.activeEvent) {
            this.activeEvent.active = true
        }
    }

    renderActiveEvent() {
        if (!this.activeEvent || this.activeEvent.type != 'fight') {
            return null
        }

        const icon = this.activeEvent.data.kills.length == 1 ? 'death' : 'fight'
        
        return (
            <Timeline>
                <TimelineEvent at={this.time(this.activeEvent.time)} icon={icon} />
            </Timeline>
        )
    }

    getTimeline() {
        if (!this.timeline) {
            this.timeline = new GameTimeline(this.props.game).generate()
        }

        return this.timeline
    }

    renderTracker() {
        if (!this.video) {
            return null
        }

        const timeline = this.getTimeline()

        this.markActiveEvent(timeline)

        return (
            <tracker onClick={this.seek.bind(this)} ref={(tracker) => { this.tracker = tracker }}>
                <cursor ref={(cursor) => { this.cursor = cursor }}>
                    <div className="time">{this.time(this.video.currentTime)}</div>
                </cursor>
                {timeline.map((event) => 
                    this.marker(event)
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

                    {this.renderActiveEvent()}
                </full-video>
            </tab-content>
        )
    }
}


module.exports = FullVideo