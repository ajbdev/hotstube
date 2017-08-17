const React = require('react')
const {Timeline,TimelineEvent} = require('./Timeline')


class Highlights extends React.Component { 
    
    render() {
        return (
            <tab-content>
                <div className="timeline">
                    <Timeline>
                        <TimelineEvent></TimelineEvent>
                    </Timeline>
                </div>
            </tab-content>
        )
    }
}

module.exports = Highlights