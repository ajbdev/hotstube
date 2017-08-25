const Game = require('./Game')
const Replay = require('./Replay')
const {EventEmitter} = require('events')

class ReplayAnalyzer extends EventEmitter {

    constructor(file) {
        super()

        this.GAME_EVENT_DEATH = 'NNet.Replay.Tracker.SUnitDiedEvent'
        this.GAME_EVENT_BIRTHS = 'NNet.Replay.Tracker.SUnitBornEvent'


        this.file = file
        this.replay = new Replay(file)
        this.game = new Game()

        this.analzyed = false
        this.deepAnalyzed = false
    }

    // Event types:
    // [ 'NNet.Replay.Tracker.SPlayerSetupEvent',
    //   'NNet.Replay.Tracker.SUnitBornEvent',
    //   'NNet.Replay.Tracker.SUpgradeEvent',
    //   'NNet.Replay.Tracker.SStatGameEvent',
    //   'NNet.Replay.Tracker.SUnitOwnerChangeEvent',
    //   'NNet.Replay.Tracker.SUnitDiedEvent',
    //   'NNet.Replay.Tracker.SUnitPositionsEvent',
    //   'NNet.Replay.Tracker.SUnitRevivedEvent',
    //   'NNet.Replay.Tracker.SUnitTypeChangeEvent',
    //   'NNet.Replay.Tracker.SScoreResultEvent' ]

    // Event names for SStatGameEvent
    // [ 'GameStart',
    //   'PlayerInit',
    //   'TownStructureInit',
    //   'JungleCampInit',
    //   'PlayerSpawned',
    //   'LevelUp',
    //   'TalentChosen',
    //   'GatesOpen',
    //   'RegenGlobePickedUp',
    //   'PeriodicXPBreakdown',
    //   'PlayerDeath',
    //   'Altar Captured',
    //   'Town Captured',
    //   'JungleCampCapture',
    //   'EndOfGameXPBreakdown',
    //   'EndOfGameTimeSpentDead',
    //   'EndOfGameTalentChoices',
    //   'EndOfGameMarksmanStacks',
    //   'EndOfGameUpVotesCollected' ]

    analyze(deep = false) {
        if (!this.analyzed) {
            this.shallowAnalyze()
        }

        if (deep && !this.deepAnalyzed) {
            this.deepAnalyze()
        }

        
        this.emit('GAME_ANALYZED', this.game, this.file)
    }

    clockTime(secondsIn) {
        // 35 seconds to match the game clock
        // 3 seconds due to time discrepancy 
        return secondsIn - 35 - 3
    }

    shallowAnalyze() {
        this.basicInfo()
        this.players()
        this.kills()
        this.chat()
        this.analyzed = true
    }

    deepAnalyze() {
        this.chat()
        this.levels()
        this.scores()
        this.deepAnalyzed = true
        this.emit('GAME_DEEP_ANALYZED', this.game, this.file)
    }

    scores() {
        this.game.scores = this.replay.trackerEvents()
                                .filter((e) => e._event === 'NNet.Replay.Tracker.SScoreResultEvent')
                                [0].m_instanceList.map((s) => {
                                        return {
                                            values: s.m_values.map((e) => e[0]).map((e) => e ? e.m_value : null),
                                            type: s.m_name
                                        }
                                    })
    }

    levels() {
        let prev = null
        this.game.levels = this.replay.trackerEvents()
                                  .filter(e => e._event === 'NNet.Replay.Tracker.SStatGameEvent' && e.m_eventName == 'LevelUp')
                                  .map((e) => {
                                    if (e.m_intData.length == 2) {
                                        return {
                                            team: this.game.players.filter((p) => p.playerId == e.m_intData[0].m_value)[0].team,
                                            time: e._gameloop / 16,
                                            clockTime: this.clockTime(e._gameloop / 16),
                                            level: e.m_intData[1].m_value
                                        }
                                    }
                                  })
                                  .concat()
                                  .sort()
                                  .reduce((x, y) => x.findIndex(e=>e.team==y.team && e.level == y.level) < 0 ? [...x, y]: x, [])

    }

    chat() {
        this.game.chats = this.replay.messageEvents().filter((e) => e._event === 'NNet.Game.SChatMessage').map((m) => {
            return {
                time: m._gameloop / 16,
                clockTime: this.clockTime(m._gameloop / 16),
                author: this.game.players.filter((p) => p.playerId == m._userid.m_userId+1)[0],
                message: m.m_string
            }
        })
    }

    basicInfo() {
        this.game.map = this.replay.details().m_title
        this.game.time = this.replay.header().m_elapsedGameLoops / 16
    }

    kills() {
        const deaths = this.replay.trackerEvents().filter((event) => event._event === this.GAME_EVENT_DEATH).filter((death) => this.game.players.map((p) => p.unitTagIndex).indexOf(death.m_unitTagIndex) > -1)

        const assists = this.replay.trackerEvents().filter(event => event._event === 'NNet.Replay.Tracker.SStatGameEvent' && event.m_eventName == 'PlayerDeath')

        this.game.kills = assists.map((death) => {
            let victim = null;
            let killers = [];
            let secondsIn = death._gameloop / 16;

            death.m_intData.map((datum) => {
                if (datum.m_key == 'PlayerID') {
                    victim = this.game.players[datum.m_value-1]
                } else if (datum.m_key == 'KillingPlayer') {
                    killers.push(this.game.players[datum.m_value-1])
                }
            })

            let primaryKillerPlayerId = null,
                coordinates = null;

            deaths.map((d) => {
                let dVictim = this.game.players.filter((p) => p.unitTagIndex == d.m_unitTagIndex)[0];
                let dKiller = this.game.players[d.m_killerPlayerId-1];

                if (dVictim.playerId == victim.playerId && dKiller && killers && killers.map((k) => k && k.playerId).indexOf(dKiller.playerId) > -1 && d._gameloop+1 == death._gameloop) {
                    primaryKillerPlayerId = dKiller.playerId

                    coordinates = {
                        x: dKiller.m_x,
                        y: dKiller.m_y
                    }
                }
            })

            return {
                victim: victim,
                killers: killers,
                primaryKiller: primaryKillerPlayerId,
                time: secondsIn,
                clockTime: this.clockTime(secondsIn), // Match the in-game clock
                coordinates: coordinates
            }
        })
    }

    getPlayerByToonHandle(handle) {
        return this.replay.initdata().m_syncLobbyState.m_lobbyState.m_slots.filter((slot) => { 
            return (slot.m_toonHandle.length > 0 && slot.m_toonHandle == handle)
        })[0]
    }

    players() {
        const births = this.replay.trackerEvents().filter((event) => event._event == 'NNet.Replay.Tracker.SUnitBornEvent' && event.m_controlPlayerId > 0 && event.m_controlPlayerId <= 10 && event.m_unitTypeName.slice(0,4) === 'Hero')

        this.game.players = this.replay.details().m_playerList.map((player, i) => {
            return {
                id: player.m_toon.m_id,
                isReplayOwner: false,
                name: player.m_name.toString(),
                hero: player.m_hero.toString(),
                playerId: i+1,
                team: player.m_teamId == 0 ? 'blue' : 'red',
                unitTagIndex: births.filter((birth) => birth.m_controlPlayerId == i+1 )[0].m_unitTagIndex
            }
        })
    }

    groupKillsIntoFights(kills) {

        const fights = [ [] ]
        let i = 0
        kills.map((pkill) => {
            if (fights[i] && fights[i].length > 0 && fights[i][fights[i].length-1].time < pkill.time-12) {
                i++
                fights[i] = []
            }

            fights[i].push(pkill)

        })

        return fights;
    }

    fightsFor(playerName, getAssists = true) {
        let deaths = this.game.kills.slice();

        let player = this.game.players.filter((p) => p.name == playerName)[0]

        const playerKills = this.game.kills.filter((death) => { 
            if (getAssists) {
                return death.killers.filter((killer) => killer && killer.name == playerName).length > 0 
            } else {
                return death.primaryKiller == player.playerId
            }
        })
        return this.groupKillsIntoFights(playerKills)
        // const coordinateDiff = (coordsA, coordsB) => {
        //     if (!coordsA || !coordsB) {
        //         return { x: 9999, y: 9999 }
        //     }
        //     return {
        //         x: Math.abs(coordsA.x - coordsB.x),
        //         y: Math.abs(coordsA.y - coordsB.y)
        //     }
        // }

    }

}
module.exports = ReplayAnalyzer