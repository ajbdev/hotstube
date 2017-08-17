const React = require('react')


class Timeline extends React.Component { 
    render() {
        return (
            <timeline>
                {this.props.children}
            </timeline>
        )
    }
}
class TimelineEvent extends React.Component { 
    render() {
        return (
            <timeline-event>
                <div className="time">{this.props.at}</div>
                {this.props.children}
            </timeline-event>
        )
    }
}
class TimelineMarker extends React.Component {
    render() {
        return (
            <timeline-marker>
                This is when shit got <i>weird</i>
            </timeline-marker>
        )
    }
}

module.exports.Timeline = Timeline
module.exports.TimelineEvent = TimelineEvent
module.exports.TimelineMarker = TimelineMarker