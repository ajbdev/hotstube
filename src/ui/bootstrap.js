const ReactDOM = require('react-dom')
const React = require('react')
const App = require('./ui/App')
const Rollbar = require('rollbar')
const _env = require('./env')

if (_env !== 'development') {
  const rollbar = new Rollbar({
    accessToken: '5209cc3fb71f498190ecf601df11d98b',
    captureUncaught: true,
    captureUnhandledRejections: true,
    environment: _env
  })
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
)