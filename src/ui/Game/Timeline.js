const React = require('react')
const Svg = require('../App/Svg')

function Timeline(props) {
    return (
        <timeline>
            {props.children}
        </timeline>
    )
}

function TimelineEvent(props) { 
    return (
        <timeline-event>
            {props.icon ? <Svg className={props.icon} src={props.icon + ".svg"} /> : null}
            <div className="time">{props.at}</div>
            <div className="content">
                {props.children}
            </div>                
        </timeline-event>
    )
}
function TimelineMarker(props) {
    if (props.type === 'circle') {
        let style = {},
            labelStyle = {},
            contentStyle = {}

        if (props.color) {
            style.borderColor = props.color
        }

        const label = props.label.toString()
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
            <timeline-marker class={props.type} style={style}>
                {props.label ? <div className="label" style={labelStyle}>{props.label}</div> : null}
                {props.svg ? <Svg src={props.svg} /> : null}
                {props.children.length > 0 ? <div className="content" style={contentStyle}>{props.children}</div> : null}
            </timeline-marker>
        )
    }

    return (
        <timeline-marker class={props.type}>
            {props.children}
        </timeline-marker>
    )
}

module.exports.Timeline = Timeline
module.exports.TimelineEvent = TimelineEvent
module.exports.TimelineMarker = TimelineMarker