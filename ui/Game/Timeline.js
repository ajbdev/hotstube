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
            <timeline-event>{this.props.children}</timeline-event>
        )
    }
}

module.exports.Timeline = Timeline
module.exports.TimelineEvent = TimelineEvent