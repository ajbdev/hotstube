const HighlightDir = require('./lib/HighlightDir')

onmessage = (args) => {
    let dir = args.data[0],
        days = args.data[1]       

    const highlightDir = new HighlightDir(dir)
    highlightDir.prune(days)
}