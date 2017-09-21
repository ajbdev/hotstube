const PlayerName = require('./PlayerName')
const HeroPortrait = require('./HeroPortrait')
const GameTimeline = require('../../lib/GameTimeline')
const Players = require('../../lib/Players')
const {Timeline,TimelineEvent,TimelineMarker} = require('./Timeline')
const React = require('react')

let players = null

function time(seconds, seperator = ':') {
    if (seconds < 0) {
        return seconds
    }

    return ~~(seconds / 60) + seperator + (seconds % 60 < 10 ? "0" : "") + Math.floor(seconds % 60)
}

function killer(kill) {
    let killer = players.find((kill.killers.filter((killer) => killer == kill.primaryKiller))[0])


    if (!killer) {
        killer = {
            name: 'Nexus Forces',
            hero: 'Nexus'
        }
    }

    return killer
}

function renderHighlight(game, secondsIn, caption, highlightVideoComponent) {
    if (!game.highlights || !game.highlights[time(secondsIn, '.')]) {
        return null
    }

    console.log(highlightVideoComponent)

    const HighlightVideoComponent = {
        'HighlightVideoWeb': HighlightVideoWeb
    }

    return <HighlightVideoComponent path={game.highlights[time(secondsIn, '.')]} caption={caption} />
    
}

function renderFight(game, kills, key, highlightVideoComponent) {
    const chat = game.chats.filter((c) => c.time > kills[0].time && c.time < (kills[kills.length-1].time+10))
    let caption = killer(kills[0]).name + ' kills ' + players.find(kills[0].victim).name + ' at ' + time(kills[0].time, ':')
    if (key == 0 && kills.length == 1) {
        let kill = kills[0]

        return (
            <TimelineEvent at={time(kill.clockTime)} icon="firstblood" key={key}>
                {renderHighlight(game, kill.time, caption, highlightVideoComponent)}
                <PlayerName player={killer(kill)} /> drew first blood on <PlayerName player={players.find(kill.victim)} />
                {chat.map((c, i) => renderChat(c, i))}
            </TimelineEvent>
        )
    } 

    if (kills.length == 1) {
        let kill = kills[0]
        return (
            <TimelineEvent at={time(kill.clockTime)} icon="death" key={key}>
                {renderHighlight(game, kill.time, caption)}
                {renderKill(kill)}
                {chat.map((c, i) => renderChat(c, i))}
            </TimelineEvent>
        )
    }

    return (
        <TimelineEvent at={time(kills[0].clockTime)} icon="fight" key={key}>
            {kills.map((kill, ix) => 
                <span key={ix}>
                    {renderHighlight(game, kill.time, caption)}
                    {renderKill(kill)}
                </span>
            )}
            {chat.map((c, i) => renderChat(c, i))}
        </TimelineEvent>
    )
}

function renderChat(chat, i) {
    return (
        <div key={i}>
            <PlayerName player={chat.author} /> says, "{chat.message}"
        </div>
    )
}

function renderKill(kill) {
    let assists = kill.killers.filter((killer) => killer != kill.primaryKiller)
    
    return (
        <div className="kill">
            <PlayerName player={killer(kill)} /> killed <PlayerName player={players.find(kill.victim)} /> 
            {assists.length > 0 ? 
            <span> (Assisted by 
                {assists.map((assist, ix) =>
                    <HeroPortrait hero={players.find(assist).hero} key={ix} />
                )}
            ) </span> : null}
        </div>
    )
}


function renderLevel(game, level, key) {
    const team = level.team.charAt(0).toUpperCase() + level.team.slice(1).toLowerCase();

    return (
        <TimelineMarker type="hash" key={key}>
            <b>{time(level.clockTime)}</b> <span className={level.team}>{team}</span> hits level {level.level}
        </TimelineMarker>
    )
}

function renderEvent(game, event, key, highlightVideoComponent) {
    if (event.type == 'fight') {
        return renderFight(game, event.data.kills, key, highlightVideoComponent)
    }
    if (event.type == 'level') {
        return renderLevel(game, event.data, key)
    }
}

function renderEmpty() {
    return (
        <TimelineEvent at="Nothing happened!">
            This replay seems to be empty. 
            This happens if a game is quit early or on certain custom maps.  
        </TimelineEvent>
    )
}

function renderGameOver(game, heroId) {
    const player = game.players.filter((p) => p.id === heroId)[0]
    
    const outcome = player.outcome = 'Win' ? 'wins' : 'loses'

    return (
        <TimelineMarker type="circle" label={time(game.time-35)}>
            Game over: <span className={player.team}>{player.team}</span> {outcome}
        </TimelineMarker>
    )
}

function Highlights(props) {
    const timeline = new GameTimeline(props.game).generate()

    players = new Players(props.game.players)

    return (
        <tab-content>
            <Timeline>
                {timeline.length > 0 ? 
                    timeline.map((event, key) =>
                        renderEvent(props.game, event, key, props.highlightVideoComponent)
                    ) : renderEmpty()
                }
                {renderGameOver(props.game, props.heroId)}
            </Timeline>
        </tab-content>
    )
}


module.exports = Highlights