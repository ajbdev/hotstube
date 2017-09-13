const ReplayAnalyzer = require('./lib/ReplayAnalyzer')

const env = require('./env')

onmessage = (args) => {

    args.data.map((file) => {
        let analyzer = new ReplayAnalyzer(file)

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