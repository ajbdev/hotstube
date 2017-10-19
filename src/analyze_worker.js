const ReplayAnalyzer = require('./lib/ReplayAnalyzer')

const env = require('./env').env

onmessage = (args) => {

    let protocolDir = args.data.shift()

    args.data.map((file) => {
        let analyzer = new ReplayAnalyzer(file)

        analyzer.replay.protocolDir = protocolDir

        try {
            postMessage('Analyzing ' + file)
            analyzer.analyze()

            postMessage({ game: analyzer.game, replay: file })
        } catch (ex) {
            postMessage({ error: true, replay:  file, message: 'Could not load replay: ' + ex })

            if (env == 'development') {
                throw ex
            }
        }
    })

}