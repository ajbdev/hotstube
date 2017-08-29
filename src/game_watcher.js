const GameStateWatcher = require('./lib/GameStateWatcher')
const GameRecorder = require('./lib/GameRecorder')
const VideoClipMaker = require('./lib/VideoClipMaker')
const HighlightReel = require('./lib/HighlightReel') 
const Config = require('./lib/Config')
const fs = require('fs')

const pathResolver = require('path')

let gameInitializedAt = 0
let replayFile = null
let videoFile = null
let highlightReel = null
let playerName = null
let playerId = null;

GameStateWatcher.watch().on('GAME_START', () => { 
    GameRecorder.startRecording()
}).on('GAME_IS_RUNNING', () => {
    console.log('Game is already started')
    GameRecorder.startRecording()
}).on('GAME_END', (path) => {
    console.log('Game end caught')
    replayFile = pathResolver.resolve(path)
    GameRecorder.stopRecording()
    
    createHighlightReel()
}).on('STORMSAVE_CREATED', (path) => {
    // Currently this indicates the 90 second mark
    // We subtract the six additional seconds to sync with the video recorder start time
    gameInitializedAt = GameStateWatcher.gameSeconds - 90 - 3
    console.log('Game initialized at: ' + gameInitializedAt)
})

GameRecorder.on('VIDEO_SAVED', (path) => {
    let sourceVideoFile = pathResolver.resolve(path)
    
    console.log('Caught video ' + sourceVideoFile)

    const clip = new VideoClipMaker(sourceVideoFile)

    if (!replayFile) {
        console.log('No replay file found')
        return
    }

    // Remove the initial loading screen so the game timer matches the replay closely
    const clippedVideoFileName = pathResolver.win32.basename(replayFile)

    Config.load()
    const videoFilePath = Config.highlightsSavePath(clippedVideoFileName)

    videoFile = clip.make(videoFilePath, gameInitializedAt)

    console.log('Created ' + videoFile)
    fs.unlink(sourceVideoFile, (err) => {
        if (err) {
            console.log('Could not delete source video: ' + err)
        } else {
            console.log('Deleted ' + sourceVideoFile)
        }
    })

    createHighlightReel()
})

const createHighlightReel = function() {
    if (!videoFile || !replayFile || highlightReel) {
        return;
    }
    console.log('Starting highlight reel')

    let reel = new HighlightReel(replayFile, videoFile)
    reel.create()
}

