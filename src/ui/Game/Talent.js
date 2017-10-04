const React = require('react')
const {Tooltip}  = require('react-lightweight-tooltip')
class Talent extends React.Component {
    constructor() {
        super()
    }
    style() {
        let src = this.props.talent.icon.small

        return {
            backgroundImage: 'url("' + src + '")'
        }
    }

    render() {
        if (this.props.hover) {
            return (
                <Tooltip content={this.props.talent.name}>
                    <talent style={this.style()}></talent>
                </Tooltip>
            )
        }

        return <talent style={this.style()}></talent>
    }
}
module.exports = Talent