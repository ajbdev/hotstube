const React = require('react')
const {Timeline,TimelineEvent,TimelineMarker} = require('./Timeline')
const ReplayAnalyzer = require('../../lib/ReplayAnalyzer')
const PlayerName = require('./PlayerName')
const HighlightReel = require('../../lib/HighlightReel')
const HeroPortrait = require('../HeroPortrait')
const pathResolver = require('path')
const ConfigOptions = require('../../lib/Config')
const fs = require('fs')
const {app, dialog} = require('electron').remote
const Svg = require('../Svg')

class Highlights extends React.Component { 

    time(seconds, seperator = ':') {
        if (seconds < 0) {
            return seconds
        }

        return ~~(seconds / 60) + seperator + (seconds % 60 < 10 ? "0" : "") + Math.floor(seconds % 60)
    }

    timeline() {
        const timeline = []
        const analyzer = new ReplayAnalyzer(this.props.replay.name)
        const fights = analyzer.groupKillsIntoFights(this.props.replay.game.kills).slice()

        fights.map((fight) => {
            if (fight.length > 0) {
                timeline.push({
                    time: fight[0].clockTime,
                    type: 'fight',
                    kills: fight
                 })
            }
        })

        this.props.replay.game.levels.map((lvl) => {
            if (lvl.level == 10 || lvl.level == 20) {
                timeline.push(Object.assign({ type: 'level' }, lvl))
            }
        })

        timeline.sort((a,b) => a.time - b.time)

        return timeline
    }

    killer(kill) {
        let killer = (kill.killers.filter((killer) => killer && killer.playerId == kill.primaryKiller))[0]

        if (!killer) {
            killer = {
                name: 'Nexus Forces',
                hero: 'Nexus'
            }
        }

        return killer
    }

    renderLevel(level, key) {
        const team = level.team.charAt(0).toUpperCase() + level.team.slice(1).toLowerCase();

        return (
            <TimelineMarker type="hash" key={key}>
                <b>{this.time(level.clockTime)}</b> <span className={level.team}>{team}</span> hits level {level.level}
            </TimelineMarker>
        )
    }

    renderFight(kills, key) {
        let game = this.props.replay.game

        let clipAttrs = { 
            replay: this.props.replay.name,
            setStatus: this.props.setStatus,
            heroId: this.props.replay.heroId, 
            accountId: this.props.replay.accountId,
            caption: this.killer(kills[0]).name + ' kills ' + kills[0].victim.name + ' at ' + this.time(kills[0].time, '.')
        }

        const chat = this.props.replay.game.chats.filter((c) => c.time > kills[0].time && c.time < (kills[kills.length-1].time+10))

        if (key == 0 && kills.length == 1) {
            let kill = kills[0]
            return (
                <TimelineEvent at={this.time(kill.clockTime)} icon="firstblood" key={key}>
                    <HighlightClip at={this.time(kill.time, '.')} {...clipAttrs} />
                    <PlayerName player={this.killer(kill)} /> drew first blood on <PlayerName player={kill.victim} />
                    {chat.map((c, i) => this.renderChat(c, i))}
                </TimelineEvent>
            )
        } 

        if (kills.length == 1) {
            let kill = kills[0]
            return (
                <TimelineEvent at={this.time(kill.clockTime)} icon="death" key={key}>
                    <HighlightClip at={this.time(kill.time, '.')} {...clipAttrs} />
                    {this.renderKill(kill)}
                    {chat.map((c, i) => this.renderChat(c, i))}
                </TimelineEvent>
            )
        }
        
        return (
            <TimelineEvent at={this.time(kills[0].clockTime)} icon="fight" key={key}>
                <HighlightClip at={this.time(kills[0].time, '.')} {...clipAttrs} />
                {kills.map((kill, ix) => 
                    <span key={ix}>
                        {this.renderKill(kill)}
                    </span>
                )}
                {chat.map((c, i) => this.renderChat(c, i))}
            </TimelineEvent>
        )
    }

    renderChat(chat, i) {
        return (
            <div key={i}>
                <PlayerName player={chat.author} /> says, "{chat.message}"
            </div>
        )
    }

    renderKill(kill) {

        let assists = kill.killers.filter((killer) => killer && killer.playerId != kill.primaryKiller)

        return (
            <div className="kill">
                <PlayerName player={this.killer(kill)} /> killed <PlayerName player={kill.victim} /> 
                {assists.length > 0 ? 
                <span> (Assisted by 
                    {assists.map((assist, ix) =>
                        <HeroPortrait hero={assist.hero} key={ix} />
                    )}
                ) </span> : null}
            </div>
        )
    }

    renderEvent(event, key) {
        if (event.type == 'fight') {
            return this.renderFight(event.kills, key)
        }
        if (event.type == 'level') {
            return this.renderLevel(event, key)
        }
    }

    renderEmpty() {
        return (
            <TimelineEvent at="Nothing happened!">
                This replay seems to be empty. 
                This happens if a game is quit early or on certain custom maps.  
            </TimelineEvent>
        )
    }
    
    render() {
        if (!this.props.replay) {
            return null
        }

        let timeline = this.timeline()

        return (
            <tab-content>
                <div className="timeline">
                    <Timeline>
                        {timeline.length > 0 ? 
                            timeline.map((event, key) =>
                                this.renderEvent(event, key)
                            ) : this.renderEmpty()
                        }
                        <TimelineMarker type="circle" label={this.time(this.props.replay.game.time-35)}>
                            Game over
                        </TimelineMarker>
                    </Timeline>
                </div>
            </tab-content>
        )

        return (
            <tab-content>
                <div className="timeline">
                    <Timeline>
                        <TimelineEvent at="1:07" icon="spawn">
                            Player 1 spawned
                        </TimelineEvent>
                        <TimelineMarker type="circle" label="10" color="red">
                            10 Minutes
                        </TimelineMarker>
                        <TimelineEvent at="2:07" icon="firstblood">
                            Player 2 gets first BLOODs
                        </TimelineEvent>
                        <TimelineMarker type="hash">
                            Team 1 hits level 10
                        </TimelineMarker>
                        <TimelineEvent at="4:45" icon="fight">
                            Player 3 engages a FIGHT!
                        </TimelineEvent>
                        <TimelineEvent at="5:15" icon="death">
                            Player 2 died to Player 5
                        </TimelineEvent>
                        <TimelineEvent at="5:15" icon="objective">
                            Red team acquired the objective
                        </TimelineEvent>
                        <TimelineMarker type="circle" label="22:54" color="red" end={true}>
                            Red team wins
                        </TimelineMarker>
                        <TimelineMarker type="circle" label="22:5" color="red" end={true}>
                            Red team wins
                        </TimelineMarker>
                    </Timeline>
                </div>
            </tab-content>
        )
    }
}
class HighlightClip extends React.Component { 
    constructor() {
        super()

        this.state = { playing: false }

        this.videoBinded = false
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
    }
    toggleVideo() {
        if (!this.videoBinded) {
            this.bindVideoEvents()
        }

        let action = this.state.playing ? 'pause' : 'play'

        this.video[action]()
    }
    save(video) {
        let self = this

        dialog.showSaveDialog({
            title: 'Save highlight',
            buttonLabel: 'Save',
            showsTagField: false,
            defaultPath: app.getPath('documents') + '/' + this.props.caption + '.gifv',
            filters: [
                {name: 'gifv', extensions: ['gifv']},
            ]
        }, (file) => {
            if (!file) {
                return
            }

            console.log(file + ' saved')
            fs.access(video, fs.F_OK, function (error) {
                if (error) {
                    console.log('Video not saved: ' + error)
                } else {
                    var input = fs.createReadStream(video);
                    var output = fs.createWriteStream(file);
    
                    function handleErrors(error) {
                        input.destroy();
                        output.end();
                        console.log('Video not saved: ' + error)
                    }
    
                    input.on('error', handleErrors);
                    output.on('error', handleErrors);
    
                    output.on('finish', () => {
                        self.props.setStatus('Highlight saved')
                    })
    
                    input.pipe(output);
                }
            });
        })
    }

    render() {
        let at = this.props.at

        let path = HighlightReel.getSavePath(this.props.accountId, this.props.heroId, pathResolver.basename(this.props.replay,'.StormReplay'))

        path = pathResolver.join(path, at + '.webm')

        let attrs = {
            width: 640,
            ref: (video) => { this.video = video }
        }

        if (ConfigOptions.options.fullVideoControls) {
            attrs.controls = true
        }

        if (fs.existsSync(path)) {
            return (
                <span>
                    <highlight-reel onClick={this.toggleVideo.bind(this)}>
                        {!this.state.playing ? <video-controls></video-controls> : null}
                        <video src={path} {...attrs} />
                    </highlight-reel>
                    <Svg src="download.svg" onClick={() => this.save(path)} className="video-download" />
                </span>
            )
        }

        return null
    }
}

module.exports = Highlights