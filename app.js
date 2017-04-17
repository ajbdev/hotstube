const GameStateWatcher = require('./lib/GameStateWatcher')
const GameRecorder = require('./lib/GameRecorder')

const recorder = new GameRecorder()
const watcher = new GameStateWatcher()

watcher.watch()
.on('GAME_START', () => { 
    recorder.startRecording()
    
}).on('GAME_END', () => {

})


setTimeout(()=> { recorder.stopRecording() }, 3500)
