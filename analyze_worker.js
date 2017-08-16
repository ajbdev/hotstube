const ReplayAnalyzer = require('./lib/ReplayAnalyzer')

onmessage = (args) => {
    let replay = args.data

    let analyzer = new ReplayAnalyzer(replay)

    try {
        postMessage('Analyzing ' + replay)
        analyzer.analyze()

        postMessage({ game: analyzer.game, replay: replay })
    } catch (ex) {
        console.log('Could not load replay: ' + ex)
    }
}