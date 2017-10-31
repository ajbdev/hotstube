const ReactDOM = require('react-dom')
const React = require('react')
const App = require('./ui/App')
const Rollbar = require('rollbar')
const _env = require('./env').env
const Config = require('./lib/Config')
const analytics = require('./lib/GoogleAnalytics')
const version = require('electron').remote.app.version

Config.load()

if (_env !== 'development') {
  let opts = Object.assign({}, Config.options)

  const rollbar = new Rollbar({
    accessToken: '5209cc3fb71f498190ecf601df11d98b',
    captureUncaught: true,
    scrubFields: ['streamablePassword'],
    captureUnhandledRejections: true,
    environment: _env,
    payload: {
      config: opts,
      context: 'renderer-thread'
    }
  })
}

let errorHandler = window.onerror

window.onerror = function(m, f, l, c, e) {
  const renderCrash = require('./ui/Crash')
  errorHandler(m, f, l, c, e)
  renderCrash()
}

analytics.page('HotSTube', '/')
analytics.event('App','loaded')

ReactDOM.render(
    <App />,
    document.getElementById('root')
)