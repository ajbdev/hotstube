const spawn  = require('child_process')
const pathResolver = require('path')

class VideoClipMaker {
    constructor(video) {
        this.video = video
        this.ffmpeg = './bin/ffmpeg.exe'
    }

    make(fileName, start, duration = null) {
        fileName = fileName + '.webm'

        let args = ['-y','-ss',start,'-i',this.video,]
        
        if (duration) {
            args = args.concat(['-t',duration])
        }
        args = args.concat(['-c','copy',fileName])

        spawn.execFileSync(this.ffmpeg, args)

        return pathResolver.resolve('./' + fileName)
    }

}

module.exports = VideoClipMaker