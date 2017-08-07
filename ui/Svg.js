const React = require('react')
const fs = require('fs')

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

        fs.readFile('./svg/' + this.props.src, 'utf-8', (err, data) => {
            self.setState({ svg: data })
        })
    }

    render() {
        if (!this.state.svg) {
            return null
        }

        return (
            <div dangerouslySetInnerHTML={{ __html: this.state.svg}} {...this.props}></div>
        )
    }
}

module.exports = Svg