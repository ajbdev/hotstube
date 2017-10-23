const GameEvent = require('./GameEvent')

class GameTimeline {
    constructor(game) {
        this.game = game
        this.levelsToDisplay = [10, 20]
        this.timeline = []
    }

    generate() {
        const fights = this.groupKillsIntoFights(this.game.kills).slice()

        fights.map((fight) => {
            if (fight.length > 0) {
                this.timeline.push(new GameEvent(
                    fight[0].time,
                    'fight',
                    { kills: fight }
                ))
            }
        })

        this.game.levels.map((lvl) => {
            if (this.levelsToDisplay.indexOf(lvl.level) > -1) {
                this.timeline.push(new GameEvent(
                    lvl.time,
                    'level',
                    lvl
                ))
            }
        })

        this.timeline.sort((a,b) => a.time - b.time)

        return this.timeline
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
                return death.killers.filter((killer) => killer == player.playerId).length > 0 
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

module.exports = GameTimeline