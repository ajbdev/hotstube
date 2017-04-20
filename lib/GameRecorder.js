const fs = require('fs')
const {EventEmitter} = require('events')
const {desktopCapturer} = require('electron')

class GameRecorder extends EventEmitter {
    constructor() {
        super()

        this.WINDOW_TITLE = "Heroes of the Storm"
        this.recorder = null
        this.recording = false
    }

    startRecording() {
        if (this.recording) {
            return
        }

        this.recording = true
        let self = this

        desktopCapturer.getSources({ types: ['window', 'screen'] }, function(error, sources) {
            if (error) throw error

            for (let i = 0; i < sources.length; i++) {
                let src = sources[i]
                if (src.name === self.WINDOW_TITLE) {
                    navigator.webkitGetUserMedia({
                        audio: {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: src.id, 
                            }
                        },
                        video: {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: src.id,
                                minWidth: 800,
                                maxWidth: 1280,
                                minHeight: 600,
                                maxHeight: 720
                            }
                        }
                    }, self.handleStream.bind(self), self.handleUserMediaError)
                    return
                }
            }
        });
    }

    handleStream(stream) {
        console.info('Started recording')
        this.recorder = new MediaRecorder(stream)
        this.chunks = []
        let self = this
        this.recorder.ondataavailable = function(event) {
            self.chunks.push(event.data)
        };
        this.recorder.start()
        this.emit('RECORDER_START')
        console.log(this);
    }

    handleUserMediaError(e) {
        console.error('handleUserMediaError', e);
    }

    stopRecording() {
        if (!this.recording) {
            return
        }
        this.recorder.stop()
        this.emit('RECORDER_END')
        this.recording = false

        console.info('Ended recording')

        const self = this
        this.toArrayBuffer(new Blob(this.chunks, {type: 'video/webm'}), function(ab) {
            let buffer = self.toBuffer(ab)
            let file = `./test.webm`
            fs.writeFile(file, buffer, function(err) {
                if (err) {
                    console.error('Failed to save video ' + err)
                } else {
                    console.log('Saved video: ' + file)
                }
            });
        });
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

module.exports = GameRecorder