const React = require('react')
const Svg = require('./Svg')
const { shell } = require('electron')
const RecordingIndicator = require('./RecordingIndicator')

class StatusBar extends React.Component {
    constructor() {
        super()
    }

    renderDiscordTeaser() {
        const openDiscord = () => {
            shell.openExternal('https://discord.gg/6sGw6kY')
        }

        return (
            <div>
                <a onClick={openDiscord}>
                    <Svg src="discord.svg" className="discord" />
                    Join us on Discord
                </a>
            </div>
        )
    }

    renderMessage() {
        return (
            <div>
                {this.props.message}
            </div>
        )
    }

    render() {
        const type = this.props.type && this.props.type.length > 0 ? this.props.type : 'Message';
        const method = 'render' + type;

        return (
            <status-bar>
                <RecordingIndicator hideNotRecording={true} setStatus={this.props.setStatus} />
                {this[method] ? this[method]() : null}
            </status-bar>
        )
    }
}

module.exports = StatusBar