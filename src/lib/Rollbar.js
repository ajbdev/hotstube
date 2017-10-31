const Rollbar = require('rollbar')
const _env = require('../env').env
const Config = require('./Config')
const electron = require('electron')
const app = electron.remote ? electron.remote.app : electron.app

let opts = Object.assign({}, Config.options)
let rollbar = {}

rollbar.error = rollbar.warning = rollbar.critical = rollbar.info = rollbar.debug = (message) => {
    console.log(message)
}

if (_env != "development" || true) {
  rollbar = new Rollbar({
    accessToken: '5209cc3fb71f498190ecf601df11d98b',
    captureUncaught: true,
    captureUnhandledRejections: true,
    scrubFields: ['streamablePassword'],
    environment: _env,
    payload: {
      config: opts,
      code_version: app.version,
      context: 'main-threads'
    }
  })
}

module.exports = rollbar