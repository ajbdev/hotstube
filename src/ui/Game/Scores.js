const React = require('react')
const PlayerName = require('./PlayerName')
const HeroPortrait = require('../HeroPortrait')

class Scores extends React.Component { 
    constructor() {
        super()

        this.state = {
            columns: this.defaultStats(),
            stats: this.availableStats()
        }
    }

    renderRow(score, ix) {
        if (this.state.stats.indexOf(score.type) < 0) {
            return null
        }

        return (
            <tr key={ix}>
                <th>{this.label(score.type)}</th>
                {this.props.replay.game.players.map((p,jx) =>
                    <td key={jx} className={'length-' + score.values[jx].toString().length}>{this.value(score.type,score.values[jx])}</td>
                )}
            </tr>
        )
    }

    render() {
        const game = this.props.replay.game

        return (
            <tab-content>
                <game-scores>
                    <table>
                        <thead>
                            <tr>
                                <th></th>
                                {game.players.map((p) => 
                                    <th key={p.name}>
                                        <span>
                                            <span className="axis-label">
                                                {p.name}
                                            </span>
                                            <HeroPortrait hero={p.hero} />
                                        </span>
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                        {game.scores.map((score, ix) => 
                            this.renderRow(score, ix)
                        )}
                        </tbody>

                    </table>
                </game-scores>
            </tab-content>
        )
    }

    value(col, val) {


        return val
    }

    label(col) {
        const map = {
            'SoloKill': 'Kills',
            'OnFireTimeOnFire': 'Time On Fire',
            'VengeancesPerformed': 'Vengeances',
            'EscapesPerformed': 'Escapes',
            'ClutchHealsPerformed': 'Clutch Heals',
            'TeamfightHealingDone': 'Team Fight Healing',
            'TeamfightDamageTaken': 'Team Fight Dmg Taken',
            'TeamfightHeroDamage': 'Team Fight Hero Dmg',
            'TimeCCdEnemyHeroes': 'Time CC\'d Enemry Heroes'
        }

        if (map.hasOwnProperty(col)) {
            return map[col]
        }

        return col.replace(/([A-Z])/g, ' $1')
                  .replace(/^./, function(str){ return str.toUpperCase() })
                  .trim()
    }

    availableStats() {
        const stats = this.defaultStats().concat([
            'SelfHealing','TimeSpentDead','CreepDamage','SummonDamage','HighestKillStreak',
            'TimeSilencingEnemyHeroes','TimeRootingEnemyHeroes','TimeStunningEnemyHeroes','TimeCCdEnemyHeroes',
            'ClutchHealsPerformed','EscapesPerformed','VengeancesPerformed','OutnumberedDeaths',
            'TeamfightHealingDone','TeamfightDamageTaken','TeamfightHeroDamage',
            'OnFireTimeOnFire'
        ])

        return stats
    }

    defaultStats() {
        return ['Takedowns','SoloKill','Deaths','Assists','HeroDamage','DamageTaken','ExperienceContribution']
    }
}

module.exports = Scores