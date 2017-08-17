const spawn  = require('child_process')
const pathResolver = require('path')
const os = require('os');

class VideoClipMaker {
    constructor(video) {
        this.video = video
        const bin = os.platform() == 'win32' ? '../bin/ffmpeg.exe' : '../bin/ffmpeg'
        this.ffmpeg = pathResolver.join(__dirname, bin)
    }

    make(fileName, start, duration = null) {
        fileName = fileName + '.webm'

        let args = ['-y','-sn','-ss',start,'-i',this.video]
        
        if (duration) {
            args = args.concat(['-t',duration])
        }
        args = args.concat(['-c','copy',fileName])

        spawn.execFileSync(this.ffmpeg, args)

        return pathResolver.resolve('./' + fileName)
    }

}

module.exports = VideoClipMaker