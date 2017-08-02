const ReactDOM = require('react-dom')
const React = require('react')

const { App } = require('./App')

require('../style/shoelace.css')

ReactDOM.render(
    <App />,
    document.getElementById('root')
)