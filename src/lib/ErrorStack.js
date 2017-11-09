const process = require('process')
const request = require('request')
const qs = require('querystring')
const Config = require('./Config')
const env = require('../env').env
const electron = require('electron')
const os = require('os')
const app = electron.remote ? electron.remote.app : electron.app

class ErrorStack {
    constructor() {
        this.key = '4296db773e33cd37681a63f39c1a6297'
        this.url = 'http://www.errorstack.com'
        this.errorUrl = this.url + '/submit'
        this.logUrl = this.url + '/log'

        this.register()
    }

    register() {
        if (typeof window !== 'undefined' && window.onerror) {
            window.onerror = (message, source, lineno, colno, error) => {
                this.error(message,
                    { 
                        src: source,
                        line: lineno,
                        column: colno
                    }
                )
            }
        }

        process.on('uncaughtException', (error) => {
            this.error(error.message,
                { 
                    code: error.code,
                    stack: error.stack
                }
            )
        })
    }

    error(message, payload) {
        const repoCommitHistoryUrl = 'https://api.github.com/repos/heroespatchnotes/heroes-talents/commits'
        const headers = {'User-Agent': 'HotSTube v' + app.getVersion()}

        let opts = Object.assign({}, Config.options)
        delete opts.streamablePassword
        
        let query = qs.stringify(Object.assign({
            _s: this.key,
            _r: 'json',
            message: message,
            env: env,
            platform: os.platform(),
            version: app.getVersion(),
            config: JSON.stringify(opts),
            thread: electron.remote ? 'electron' : 'main'
        }, payload))
        
        request(this.errorUrl + '?' +  query, { method: 'POST' }, (err, response, body) => { })
    }
}

module.exports = new ErrorStack