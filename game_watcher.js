const GameStateWatcher = require('./lib/GameStateWatcher')
const GameRecorder = require('./lib/GameRecorder')
const VideoClipMaker = require('./lib/VideoClipMaker')
const HighlightReel = require('./lib/HighlightReel')

const pathResolver = require('path')

const recorder = new GameRecorder()
const watcher = new GameStateWatcher()

let gameInitializedAt = 0
let replayFile = null
let videoFile = null
let highlightReel = null
let playerName = null
let playerId = null;

watcher.watch().on('GAME_START', () => { 
    recorder.startRecording()
}).on('GAME_END', (path) => {
    replayFile = pathResolver.resolve(path)
    recorder.stopRecording()
    
    createHighlightReel()
}).on('STORMSAVE_CREATED', (path) => {
    // Currently this indicates the 90 second mark
    gameInitializedAt = watcher.gameSeconds - 90
    console.log('Game initialized at: ' + gameInitializedAt)
})

recorder.on('VIDEO_SAVED', (path) => {
    videoFile = pathResolver.resolve(path)
    
    console.log('Caught video ' + videoFile)

    clip = new VideoClipMaker(videoFile)

    // Remove the initial loading screen so the game timer matches the replay closely
    clippedVideoFileName = pathResolver.win32.basename(replayFile)
    videoFile = clip.make(clippedVideoFileName, gameInitializedAt)

    console.log('Created ' + videoFile)

    createHighlightReel()
})

const createHighlightReel = function() {
    if (!videoFile || !replayFile || highlightReel) {
        return;
    }
    console.log('Starting highlight reel')

    reel = new HighlightReel(replayFile, videoFile)
    reel.create()

}