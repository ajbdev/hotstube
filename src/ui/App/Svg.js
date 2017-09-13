const React = require('react')
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

        if (typeof IS_WEB !== 'undefined' && IS_WEB) {
            return require('../../assets/svg/' + this.props.src)
        } else {
            const fs = require('fs')

            return fs.readFileSync(path.join(__dirname, '../../assets/svg/' + this.props.src), 'utf-8')
        }

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