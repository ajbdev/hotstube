const ReplayAnalyzer = require('../lib/ReplayAnalyzer')

if (!process.argv[2]) {
    console.log("Usage: analyze.js <replay file>")
    process.exit()
}


const analyzer = new ReplayAnalyzer(process.argv[2]);
``
analyzer.analyze()

// analyzer.game.kills.map((kill) => {
//     console.log(kill.killers.map((killer) => killer.name).join(', ') + ' killed ' + kill.victim.name + ' at ' + kill.time + ' seconds')
// })

let fights = analyzer.fightsFor('debaser')

fights.map((fight, i) => {
    console.log('Fight #' + i + ' - ' + fight[0].time + ' seconds')
    fight.map((kill) => {
        console.log(kill.killers.map((killer) => killer.name).join(', ') + ' killed ' + kill.victim.name)
    })
});