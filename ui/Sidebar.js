const React = require('react')
const Svg = require('./Svg')

class Sidebar extends React.Component {
    constructor() {
        super()
    }
    render() {
        return (
            <sidebar>
                <close onClick={this.props.toggle}><Svg src="times.svg" /></close>
            </sidebar>
        )
    }
}

class SidebarToggle extends React.Component {
    constructor() {
        super()
    }
    render() {
        return <sidebar-toggle onClick={this.props.toggle}><Svg src="bars.svg" /></sidebar-toggle>
    }
}

module.exports = {
    Sidebar: Sidebar,
    SidebarToggle: SidebarToggle
}