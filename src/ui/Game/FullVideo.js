const React = require('react')
const Time = require('../Time')
const HeroPortrait = require('./HeroPortrait')
const Players = require('../../lib/Players')
const fs = require('fs')

class FullVideo extends React.Component {
    constructor(props) {
        super()

        this.state = { }
    }

    componentDidMount() {
        fs.readFile(this.props.replay.game.video, (err, data) => {
            let buffer = new Buffer(data)
            let arrayBuffer = new Uint8Array(buffer).buffer
            let blob = new Blob([arrayBuffer])
            let url = URL.createObjectURL(blob)

            this.setState({
                video: url
            })
        })
    }

    render() {

        return (
            <tab-content>
                <full-video>
                    <video src={this.state.video} controls={true} />
                </full-video>
            </tab-content>
        )
    }
}


module.exports = FullVideo