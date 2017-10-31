const fs = require('fs')
const {EventEmitter} = require('events')
const {desktopCapturer,screen} = require('electron')
const Config = require('./Config')
const rollbar = require('./Rollbar')

class GameRecorder extends EventEmitter {
    constructor() {
        super()

        this.WINDOW_TITLE = "Heroes of the Storm"
        this.recorder = null
        this.recording = false

        rollbar.error('Test')
    }

    startRecording() {
        if (this.recording) {
            return
        }

        if (!Config.options.enableRecording) {
            return
        }

        this.recording = true
        let self = this

        desktopCapturer.getSources({ types: ['window', 'screen'] }, function(error, sources) {
            if (error) throw error

            for (let i = 0; i < sources.length; i++) {
                let src = sources[i]
                if (src.name === self.WINDOW_TITLE) {
                    
                    Config.load()
                    
                    const display = screen.getPrimaryDisplay().size
                    const ratio = display.width / display.height

                    const resolutions = {
                        '480p': { width: parseInt(ratio*480), height: 480 },
                        '720p': { width: parseInt(ratio*720), height: 720 },
                        '1080p': { width: parseInt(ratio*1080), height: 1080 }
                    }

                    const width = resolutions[Config.options.resolution].width,
                          height = resolutions[Config.options.resolution].height

                    let media = {
                        video: {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: src.id,
                                minWidth: width,
                                maxWidth: width,
                                minHeight: height,
                                maxHeight: height
                            }
                        }
                    }

                    if (Config.options.sound === "on") {
                        media.audio = {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: src.id, 
                                echoCancellation: true
                            }
                        }
                    }

                    navigator.webkitGetUserMedia(media, self.handleStream.bind(self), self.handleUserMediaError)
                    return
                }
            }
        });
    }

    handleStream(stream) {
        console.info('Started recording')
        this.recorder = new MediaRecorder(stream,  {mimeType: 'video/webm;codecs=vp8'})
        this.chunks = []
        let self = this
        this.recorder.ondataavailable = function(event) {
            self.chunks.push(event.data)
        };
        try {
            this.recorder.start()
        } catch(err) {
            rollbar.error('Recorder not strarted: ' + err)
        }
        this.emit('RECORDER_START')
        console.log(this);
    }

    handleUserMediaError(e) {
        console.error('handleUserMediaError', e);
    }

    stopRecording() {
        if (!this.recording || !this.recorder) {
            return
        }
        try {
            this.recorder.stop()
        } catch(err) {
            rollbar.error('Recorder could not be stopped: ' + err)
        }
        
        this.emit('RECORDER_END')
        this.recording = false

        console.info('Ended recording')

        const self = this

        setTimeout(() => {
            this.toArrayBuffer(new Blob(this.chunks, {type: 'video/webm'}), function(ab) {
                let buffer = self.toBuffer(ab)
                let date = new Date()
                let file = `./replay-${date.getTime()}.webm`
                fs.writeFile(file, buffer, function(err) {
                    if (err) {
                        console.error('Failed to save video ' + err)
                    } else {
                        console.log('Saved video: ' + file)
                        self.emit('VIDEO_SAVED', file)
                    }
                });
            });
        }, 1000)
    }

    toArrayBuffer(blob, cb) {
        let fileReader = new FileReader();
        fileReader.onload = function() {
            let arrayBuffer = this.result
            cb(arrayBuffer)
        };
        fileReader.readAsArrayBuffer(blob)
    }

    toBuffer(ab) {
        let buffer = new Buffer(ab.byteLength)
        let arr = new Uint8Array(ab)
        for (let i = 0; i < arr.byteLength; i++) {
            buffer[i] = arr[i]
        }
        return buffer;
    }
}

module.exports = new GameRecorder