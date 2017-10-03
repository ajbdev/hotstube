const React = require('react')
const PlayerName = require('./PlayerName')
const HeroPortrait = require('./HeroPortrait')

class Scores extends React.Component { 
    constructor() {
        super()

        this.state = {
            selection: 'Overall'
        }

        this.tableColumns = {
            'Overall': ['SoloKill','Assists','Deaths','HeroDamage','SiegeDamage','DamageTaken','ExperienceContribution'],
            'Damage': ['HeroDamage','SiegeDamage','StructureDamage','DamageTaken','TeamfightHeroDamage','TeamfightDamageTaken'],
            'Kills': ['Takedowns','SoloKill','Deaths','Assists','HighestKillStreak','TimeSpentDead','VengeancesPerformed','EscapesPerformed'],
            'XP': ['ExperienceContribution','SiegeDamage','MinionDamage','CreepDamage']
        }
    }

    /**
     * "Takedowns", "Deaths", "TownKills", "SoloKill", "Assists", "MetaExperience", "Level", "TeamTakedowns", 
     * "ExperienceContribution", "Healing", "SiegeDamage", "StructureDamage", "MinionDamage", "HeroDamage",
     *  "MercCampCaptures", "WatchTowerCaptures", "SelfHealing", "TimeSpentDead", "TimeCCdEnemyHeroes", 
     * "CreepDamage", "SummonDamage", "Tier1Talent", "Tier2Talent", "Tier3Talent", "Tier4Talent", 
     * "Tier5Talent", "Tier6Talent", "Tier7Talent", "DamageTaken", "Role", "KilledTreasureGoblin", 
     * "GameScore", "HighestKillStreak", "TeamLevel", "ProtectionGivenToAllies", "TimeSilencingEnemyHeroes", 
     * "TimeRootingEnemyHeroes", "TimeStunningEnemyHeroes", "ClutchHealsPerformed", "EscapesPerformed", 
     * "VengeancesPerformed", "TeamfightEscapesPerformed", "OutnumberedDeaths", "TeamfightHealingDone", 
     * "TeamfightDamageTaken", "TeamfightHeroDamage", "EndOfMatchAwardMVPBoolean", 
     * "EndOfMatchAwardHighestKillStreakBoolean", "EndOfMatchAwardMostVengeancesPerformedBoolean", 
     * "EndOfMatchAwardMostDaredevilEscapesBoolean", "EndOfMatchAwardMostEscapesBoolean", 
     * "EndOfMatchAwardMostXPContributionBoolean", "EndOfMatchAwardMostHeroDamageDoneBoolean", 
     * "EndOfMatchAwardMostKillsBoolean", "EndOfMatchAwardHatTrickBoolean", "EndOfMatchAwardClutchHealerBoolean", 
     * "EndOfMatchAwardMostProtectionBoolean", "EndOfMatchAward0DeathsBoolean", 
     * "EndOfMatchAwardMostSiegeDamageDoneBoolean", "EndOfMatchAwardMostDamageTakenBoolean", 
     * "EndOfMatchAward0OutnumberedDeathsBoolean", "EndOfMatchAwardMostHealingBoolean", 
     * "EndOfMatchAwardMostStunsBoolean", "EndOfMatchAwardMostRootsBoolean", "EndOfMatchAwardMostSilencesBoolean", 
     * "EndOfMatchAwardMostMercCampsCapturedBoolean", "EndOfMatchAwardMapSpecificBoolean", 
     * "EndOfMatchAwardMostDragonShrinesCapturedBoolean", "EndOfMatchAwardMostCurseDamageDoneBoolean", 
     * "EndOfMatchAwardMostCoinsPaidBoolean", "EndOfMatchAwardMostImmortalDamageBoolean", 
     * "EndOfMatchAwardMostDamageDoneToZergBoolean", "EndOfMatchAwardMostDamageToPlantsBoolean", 
     * "EndOfMatchAwardMostDamageToMinionsBoolean", "EndOfMatchAwardMostTimeInTempleBoolean", 
     * "EndOfMatchAwardMostGemsTurnedInBoolean", "EndOfMatchAwardMostAltarDamageDone", 
     * "EndOfMatchAwardMostNukeDamageDoneBoolean", "EndOfMatchAwardMostTeamfightDamageTakenBoolean", 
     * "EndOfMatchAwardMostTeamfightHealingDoneBoolean", "EndOfMatchAwardMostTeamfightHeroDamageDoneBoolean", 
     * "EndOfMatchAwardGivenToNonwinner", "LunarNewYearSuccesfulArtifactTurnIns", 
     * "TeamWinsDiablo", "TeamWinsFemale", "TeamWinsMale", "TeamWinsStarCraft", "TeamWinsWarcraft", 
     * "WinsWarrior", "WinsAssassin", "WinsSupport", "WinsSpecialist", "WinsStarCraft", "WinsDiablo", 
     * "WinsWarcraft", "WinsMale", "WinsFemale", "PlaysStarCraft", "PlaysDiablo", "PlaysWarCraft"…]
     */

    renderScore(score, playerIndex) {
        let scores = this.props.game.scores.filter((s) => s.type == score)

        if (!scores.length) {
            return <td key={score}>None</td>
        }

        let val = scores[0].values[playerIndex].toString()

        return (
            <td key={playerIndex + ':' + score} className={'length-' + val.length}>
                {val}
            </td>
        )
    }

    renderSelectedTable() {
        let game = this.props.game
        let columns = this.tableColumns[this.state.selection]

        return (
            <table>
                <thead>
                    <tr>
                        <th></th>
                        {columns.map((col) => 
                            <th key={col}>{this.label(col)}</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {game.players.map((p, ix) => 
                        <tr key={p.name}>
                            <th className={p.team}>
                                <span>
                                    <HeroPortrait hero={p.hero} />
                                    {p.name}
                                </span>
                            </th>
                            {columns.map((col) => 
                                this.renderScore(col, ix)
                            )}
                        </tr>
                    )}
                </tbody>
            </table>
        )
    }

    render() {
        const game = this.props.game

        return (
            <tab-content>
                <game-scores>
                    <select className="score-selector" value={this.state.selection} onChange={(evt) => this.setState({ selection: evt.target.value })}>
                        {Object.keys(this.tableColumns).map((col) => <option key={col}>{col}</option>)}
                    </select>
                    {this.renderSelectedTable()}
                </game-scores>
            </tab-content>
        )
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
            'TimeCCdEnemyHeroes': 'Time CC\'d Enemry Heroes',
            'HighestKillStreak': 'Kill Streak',
            'TimeSpentDead': 'Time Dead',
            'DamageTaken': 'Dmg Taken',
            'ExperienceContribution': 'XP Total',
            'SiegeDamage': 'Siege Dmg',
            'HeroDamage': 'Hero Dmg'
        }

        if (map.hasOwnProperty(col)) {
            return map[col]
        }

        return col.replace(/([A-Z])/g, ' $1')
                  .replace(/^./, function(str){ return str.toUpperCase() })
                  .trim()
    }
}

module.exports = Scores