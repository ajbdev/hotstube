const React = require('react')
const {Timeline,TimelineEvent,TimelineMarker} = require('./Timeline')


class Highlights extends React.Component { 
    
    render() {
        return (
            <tab-content>
                <div className="timeline">
                    <Timeline>
                        <TimelineEvent at="1:07" icon="spawn">
                            Player 1 spawned
                        </TimelineEvent>
                        <TimelineEvent at="2:07" icon="firstblood">
                            Player 2 gets first BLOOD
                        </TimelineEvent>
                        <TimelineMarker>
                            10 Minutes
                        </TimelineMarker>
                    </Timeline>
                </div>
            </tab-content>
        )
    }
}

module.exports = Highlights