const VideoClipMaker = require('../lib/VideoClipMaker')

const clip = new VideoClipMaker('./fixtures/480p-sound.webm')

clip.make('test1',20)