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
        
        const evts = this.replay.trackerEvents().filter(event => event._event == 'NNet.Replay.Tracker.SStatGameEvent' && event.m_eventName == 'PlayerDeath')
    }

    kills() {
        const deaths = this.replay.trackerEvents().filter((event) => event._event == this.GAME_EVENT_DEATH).filter((death) => this.game.players.map((p) => p.unitTagIndex).indexOf(death.m_unitTagIndex) > -1)

        this.game.kills = deaths.map((death) => {
            let victim = this.game.players.filter((p) => p.unitTagIndex == death.m_unitTagIndex)[0];
            let killer = this.game.players[death.m_killerPlayerId-1];

            let secondsIn = death._gameloop / 16;

            return {
                killer: killer,
                victim: victim,
                time: secondsIn,
                coordinates: {
                    x: death.m_x,
                    y: death.m_y
                }
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
                team: player.m_teamId == 0 ? 'blue' : 'red',
                unitTagIndex: births.filter((birth) => birth.m_controlPlayerId == i+1 )[0].m_unitTagIndex
            }
        })
    }

    fightsFor(playerName) {
        let deaths = this.game.kills.slice();
        const playerKills = this.game.kills.filter((death) => death.killer && death.killer.name == playerName);

        console.log(this.game.kills)
        
        const fights = []

        const coordinateDiff = (coordsA, coordsB) => {
            return {
                x: Math.abs(coordsA.x - coordsB.x),
                y: Math.abs(coordsA.y - coordsB.y)
            }
        }

        playerKills.map(function(kill) {
            let fight = [];
            
            for (var i = deaths.length; i--;) {
                let death = deaths[i]

                let coordsDistance = coordinateDiff(death.coordinates, kill.coordinates)
                
                if (death.time > kill.time-12 && death.time < kill.time+12 && coordsDistance.x < 15 && coordsDistance.y < 15) {
                    fight.push(death)
                    deaths.splice(i, 1)
                }

                if (kill.time == death.time && kill.victim == death.victim && kill.killer == death.killer) {
                    fight.push(death)
                    deaths.splice(i, 1)
                }
            }
            fights.push(fight)
        })

        return fights;
    }

}
module.exports = ReplayAnalyzer