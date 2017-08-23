const React = require('react')

class Time extends React.Component {
    render() {
        let seconds = this.props.seconds

        let time = ~~(seconds / 60) + ":" + (seconds % 60 < 10 ? "0" : "") + Math.floor(seconds % 60);

        return <span className="time">{time}</span>
    }
}

module.exports = Time