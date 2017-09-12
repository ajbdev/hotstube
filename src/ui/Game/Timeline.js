const React = require('react')
const Svg = require('../App/Svg')


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
                {this.props.icon ? <Svg className={this.props.icon} src={this.props.icon + ".svg"} /> : null}
                <div className="time">{this.props.at}</div>
                <div className="content">
                    {this.props.children}
                </div>                
            </timeline-event>
        )
    }
}
class TimelineMarker extends React.Component {
    render() {

        if (this.props.type === 'circle') {
            let style = {},
                labelStyle = {},
                contentStyle = {}

            if (this.props.color) {
                style.borderColor = this.props.color
            }

            const label = this.props.label.toString()
            if (label.length == 6) {
                labelStyle.fontSize = '11px'
                labelStyle.marginTop = '8px'
                contentStyle.marginTop = '-22px'
            }
            if (label.length == 5) {
                labelStyle.fontSize = '12px'
                labelStyle.marginTop = '8px'
                contentStyle.marginTop = '-22px'
            }
            if (label.length == 4) {
                labelStyle.fontSize = '14px'
                labelStyle.marginTop = '6px'
                contentStyle.marginTop = '-23px'
            }

            return (
                <timeline-marker class={this.props.type} style={style}>
                    {this.props.label ? <div className="label" style={labelStyle}>{this.props.label}</div> : null}
                    {this.props.svg ? <Svg src={this.props.svg} /> : null}
                    {this.props.children.length > 0 ? <div className="content" style={contentStyle}>{this.props.children}</div> : null}
                </timeline-marker>
            )
        }

        return (
            <timeline-marker class={this.props.type}>
                {this.props.children}
            </timeline-marker>
        )
    }
}

module.exports.Timeline = Timeline
module.exports.TimelineEvent = TimelineEvent
module.exports.TimelineMarker = TimelineMarker