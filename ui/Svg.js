const React = require('react')
const fs = require('fs')
const path = require('path')

class Svg extends React.Component {
    constructor() {
        super()

        this.state = {
            svg: null
        }
    }

    componentDidMount() {
        this.getInlineSvg()
    }

    getInlineSvg() {
        let self = this

        fs.readFile(path.join(__dirname, '../assets/svg/' + this.props.src), 'utf-8', (err, data) => {
            self.setState({ svg: data })
        })
    }

    render() {
        if (!this.state.svg) {
            return null
        }

        return (
            <span className="svg" dangerouslySetInnerHTML={{ __html: this.state.svg}} {...this.props}></span>
        )
    }
}

module.exports = Svg