const React = require('react')
const remote = require('electron').remote
const Svg = require('./Svg')

class Toolbar extends React.Component {
    close() {
        let window = remote.getCurrentWindow()
        window.close()
    }
    render() {
        return (
            <toolbar>
                <drag-region></drag-region>
                <close-button onClick={this.close}><Svg src="times.svg" /></close-button>
            </toolbar>
        )
    }
}

module.exports = Toolbar