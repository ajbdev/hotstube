const React = require('react')
const Config = require('../../lib/Config')
const HotsApi = require('../../lib/HotsApi')

class ReplayUpload extends React.Component {
    constructor() {
        super()
        this.state = { uploading: true, failed: false, success: false }
    }    
    componentWillReceiveProps(newProps) {
        this.setState({
            uploading: true, 
            failed: false, 
            success: false
        }, () => {
            this.uploadGame()
        })
    }
    uploadGame() {
        const uploaded = localStorage.getItem("hotsapi-" + this.props.replay.name)

        if (uploaded) {
            this.setState({
                uploading: false,
                success: true
            })
            return
        }

        HotsApi.upload(this.props.replay.name).then((result) => {
            localStorage.setItem("hotsapi-" + this.props.replay.name, true)

            this.setState({
                uploading: false,
                success: true
            })
        },() => {
            this.setState({
                failed: true,
                uploading: false``
            })
        })
    }
    componentDidMount() {
        this.uploadGame()
    }
    renderStatus() {
        if (this.state.uploading) {
            return (
                <div className="spinner">
                    <div className="bounce1"></div>
                    <div className="bounce2"></div>
                    <div className="bounce3"></div>
                </div>
            )
        }

        if (this.state.success) {
            return (
                <span>&#x2714; </span>
            )
        }

        if (this.state.failed) {
            return (
                <span>&#10006; </span>
            )
        }

    }
    render() {
        if (!this.props.hotsApi) {
            return null
        }

        return (
            <replay-upload>
                {this.renderStatus()}
                HotSApi.net
            </replay-upload>
        )
    }
}

module.exports = ReplayUpload