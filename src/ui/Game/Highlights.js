const PlayerName = require('./PlayerName')
const HeroPortrait = require('./HeroPortrait')
const GameTimeline = require('../../lib/GameTimeline')
const Players = require('../../lib/Players')
const {Timeline,TimelineEvent,TimelineMarker} = require('./Timeline')
const React = require('react')
const HighlightVideoWeb = require('./HighlightVideoWeb')
const url = require('url')

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

function highlightPath(game, secondsIn) {
    if (!game.highlights) {
        return false
    }

    return game.highlights[time(secondsIn, '.')]
}

function renderHighlight(game, secondsIn, caption) {
    const path = highlightPath(game, secondsIn)

    if (!path) {
        return null
    }

    let parsedUrl = url.parse(path)
    
    if (parsedUrl.protocol == 'https:' || parsedUrl.protocol == 'http:') {
        return <HighlightVideoWeb url={path} caption={caption} />
    }

    const HighlightVideoFile = require('./HighlightVideoFile')
    return <HighlightVideoFile path={path} caption={caption} game={game} at={time(secondsIn, '.')} />

    
}

function renderFight(game, kills, key) {
    let icon = 'fight'
    if (key == 0 && kills.length == 1) {
        icon = 'firstblood'
    } else if (kills.length == 1) {
        icon = 'death'
    }

    return (
        <TimelineEvent at={time(kills[0].clockTime)} icon={icon} key={key}>
            {renderKills(game, kills)}
        </TimelineEvent>
    )
}

function renderChat(chat, i) {
    return (
        <tr key={i}>
            <td colSpan={3}>
                <PlayerName player={chat.author} /> says, "{chat.message}"
            </td>
        </tr>
    )
}

function renderKills(game, kills, highlights = true) {
    const chat = game.chats.filter((c) => c.time > kills[0].time && c.time < (kills[kills.length-1].time+10))
    return (
        <table className="kda">
            <thead>
                <tr>
                    <th className="k">Kill</th>
                    <th className="d">Death</th>
                    <th className="a">Assists</th>
                </tr>
            </thead>
            {kills.map((kill, ix) => renderKill(game, kill, ix, highlights))}
            {chat.length > 0 ?
                <tfoot>
                    {chat.map((c, i) => renderChat(c, i))}
                </tfoot>
                : null
            }
            <tfoot>

            </tfoot>
        </table>
    )
}

function renderKill(game, kill, ix, highlights) {
    let assists = kill.killers.filter((killer) => killer != kill.primaryKiller)
    let caption = killer(kill).name + ' kills ' + players.find(kill.victim).name + ' at ' + time(kill.time, ':')
    
    return (
        <tbody key={ix}>
            <tr>
                <td className="k">
                    <PlayerName player={killer(kill)} />
                </td>
                <td className="d">
                    <PlayerName player={players.find(kill.victim)} /> 
                </td>
                <td className="a">
                    {assists.map((assist, ix) =>
                        <HeroPortrait hero={players.find(assist).hero} key={ix} />
                    )}
                </td>
            </tr>
            {highlights && highlightPath(game, kill.time) ? 
                <tr>
                    <td colSpan={3}>
                        {renderHighlight(game, kill.time, caption)}
                    </td>
                </tr> : null
            }
        </tbody>
    )
}


function renderLevel(game, level, key) {
    const team = level.team.charAt(0).toUpperCase() + level.team.slice(1).toLowerCase()

    return (
        <TimelineMarker type="hash" key={key}>
            <b>{time(level.clockTime)}</b> <span className={level.team}>{team}</span> hits level {level.level}
        </TimelineMarker>
    )
}

function renderEvent(game, event, key) {
    if (event.type == 'fight') {
        return renderFight(game, event.data.kills, key)
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
    let player = game.players.filter((p) => p.id === heroId)[0]

    if (!player) {
        let winners = game.players.filter((p) => p.outcome == 'Win')
        if (winners.length) {
            player = winners[0]
        }
    }

    if (player) {

        let outcome = player.outcome == 'Win' ? 'wins' : 'loses'
        
        return (
            <TimelineMarker type="circle" label={time(game.time-35)}>
                Game over: <span className={player.team}>{player.team}</span> {outcome}
            </TimelineMarker>
        )
    }
    return null    
}

function KDATable(props) {
    return renderKills(props.game, props.kills, !!props.showHighlights)
}

function Highlights(props) {
    const timeline = new GameTimeline(props.game).generate()

    players = new Players(props.game.players)

    return (
        <tab-content>
            <Timeline>
                {timeline.length > 0 ? 
                    timeline.map((event, key) =>
                        renderEvent(props.game, event, key)
                    ) : renderEmpty()
                }
                {renderGameOver(props.game, props.heroId)}
            </Timeline>
        </tab-content>
    )
}


module.exports.Highlights = Highlights
module.exports.KDATable = KDATable