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

    getInlineSvg() {
        let self = this

        return fs.readFileSync(path.join(__dirname, '../assets/svg/' + this.props.src), 'utf-8')
    }

    render() {
        if (!this.svg) {
            this.svg = this.getInlineSvg()
        }

        return (
            <span dangerouslySetInnerHTML={{ __html: this.svg}} {...this.props}></span>
        )
    }
}

module.exports = Svg