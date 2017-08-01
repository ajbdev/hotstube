const ReactDOM = require('react-dom')
const React = require('react')

const { App } = require('./App')

require('../style/base.scss')

ReactDOM.render(
    <App />,
    document.getElementById('root')
)