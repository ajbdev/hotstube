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

  if (opts.streamablePassword && opts.streamablePassword.length > 0) {
    opts.streamablePassword = '******'
  }

  const rollbar = new Rollbar({
    accessToken: '5209cc3fb71f498190ecf601df11d98b',
    captureUncaught: true,
    captureUnhandledRejections: true,
    environment: _env,
    payload: {
      config: opts,
      version: version,
      context: 'renderer-thread'
    }
  })
}

analytics.page('HotSTube', '/')
analytics.event('App','loaded')

ReactDOM.render(
    <App />,
    document.getElementById('root')
)