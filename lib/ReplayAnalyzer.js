const Game = require('./Game')
const Replay = require('./Replay')

class ReplayAnalyzer {

    constructor(file) {
        this.GAME_EVENT_DEATH = 'NNet.Replay.Tracker.SUnitDiedEvent'
        this.GAME_EVENT_BIRTHS = 'NNet.Replay.Tracker.SUnitBornEvent'

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


        this.replay = new Replay(file)
        this.game = new Game()
    }

    analyze() {
        this.basicInfo()
        this.players()
        this.kills()
    }

    basicInfo() {
        this.game.map = this.replay.details().m_title
        this.game.time = this.replay.header().m_elapsedGameLoops / 16
    }

    kills() {
        const deaths = this.replay.trackerEvents().filter((event) => event._event == this.GAME_EVENT_DEATH).filter((death) => this.game.players.map((p) => p.unitTagIndex).indexOf(death.m_unitTagIndex) > -1)

        const assists = this.replay.trackerEvents().filter(event => event._event == 'NNet.Replay.Tracker.SStatGameEvent' && event.m_eventName == 'PlayerDeath')

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

    fightsFor(playerName) {
        let deaths = this.game.kills.slice();

        deaths.map((d) => 
            console.log(d.killers.map((k) => k && k.name).join(', ') + ' killed ' + d.victim.name)
        )

        let player = this.game.players.filter((p) => p.name == playerName)[0]

        const playerKills = this.game.kills.filter((death) => { 
            return death.killers.filter((killer) => killer && killer.name == playerName).length > 0 
        })

        // const coordinateDiff = (coordsA, coordsB) => {
        //     if (!coordsA || !coordsB) {
        //         return { x: 9999, y: 9999 }
        //     }
        //     return {
        //         x: Math.abs(coordsA.x - coordsB.x),
        //         y: Math.abs(coordsA.y - coordsB.y)
        //     }
        // }

        const fights = [ [] ]
        let i = 0
        let last = null;

        playerKills.map((pkill) => {
            if (fights[i] && fights[i].length > 0 && fights[i][fights[i].length-1].time < pkill.time-12) {
                i++
                fights[i] = []
            }

            fights[i].push(pkill)

        })

        return fights;
    }

}
module.exports = ReplayAnalyzer