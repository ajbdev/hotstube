const ReactDOM = require('react-dom')
const React = require('react')
const App = require('./ui/App')
const _env = require('./env').env
const Config = require('./lib/Config')
const version = require('electron').remote.app.version
const ErrorStack = require('./lib/ErrorStack')

const errorHandler = window.onerror

window.onerror = function(m, f, l, c, e) {
  const renderCrash = require('./ui/Crash')
  errorHandler(m, f, l, c, e)
  renderCrash()
}


ReactDOM.render(
    <App />,
    document.getElementById('root')
)