const {EventEmitter} = require('events')
const RestfulClient  = require('node-restful-client')
const GfycatApi = require('./GfycatApi')

class ShareHighlights extends EventEmitter {
    constructor(dir) {
        super()
        this.dir = dir

        const gfycatApi = new GfycatApi()
        
    }

    upload() {
    }
}

module.exports = ShareHighlights