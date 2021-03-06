
const Svg = require('../App/Svg')
const ShareHighlightsModal = require('./ShareHighlightsModal')
const {app, dialog} = require('electron').remote
const fs = require('fs')

class HighlightVideoFile extends React.Component { 
    constructor() {
        super()

        this.state = { playing: false, sharing: false, video: null }

        this.videoBinded = false
        this.bufferedVideo = null
    }
    bindVideoEvents() {
        this.video.onplaying = () => {
            this.setState({ playing: true })
        }

        let stop = () => {
            this.setState({ playing: false })
        }

        this.video.onended = stop
        this.video.onpause = stop

        this.videoBinded = true
    }
    toggleVideo() {
        if (!this.videoBinded) {
            this.bindVideoEvents()
        }

        let action = this.state.playing ? 'pause' : 'play'

        this.video[action]()
    }
    save(evt) {
        let self = this
        evt.stopPropagation()

        let path = this.props.path

        dialog.showSaveDialog({
            title: 'Save highlight',
            buttonLabel: 'Save',
            showsTagField: false,
            defaultPath: app.getPath('documents') + '/' + this.props.caption.replace(':','') + '.gifv',
            filters: [
                {name: 'gifv', extensions: ['gifv']},
            ]
        }, (file) => {
            if (!file) {
                return
            }

            console.log(file + ' saved')
            fs.access(video, fs.F_OK, function (error) {
                if (error) {
                    console.log('Video not saved: ' + error)
                } else {
                    var input = fs.createReadStream(video);
                    var output = fs.createWriteStream(file);
    
                    function handleErrors(error) {
                        input.destroy();
                        output.end();
                        console.log('Video not saved: ' + error)
                    }
    
                    input.on('error', handleErrors);
                    output.on('error', handleErrors);
    
                    input.pipe(output);
                }
            });
        })
    }

    componentDidMount() {
        this.loadVideoToTmpPath()
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.path != this.props.path) {
            this.loadVideoToTmpPath(nextProps)
        }
    }

    loadVideoToTmpPath(props = null) {
        if (!props) {
            props = this.props
        }

        if (!props.path) {
            return
        }

        const fs = require('fs')

        fs.readFile(props.path, (err, data) => {
            let buffer = new Buffer(data)
            let arrayBuffer = new Uint8Array(buffer).buffer
            let blob = new Blob([arrayBuffer])
            let url = URL.createObjectURL(blob)

            this.setState({
                video: url
            })
        })

    }

    share(evt) {
        evt.stopPropagation()
        this.setState({ sharing: true })
    }

    render() {

        if (!this.state.video) {
            return null
        }

        let attrs = {
            width: 615,
            ref: (video) => { this.video = video }
        }

        let ConfigOptions = { options: {} }
        if (typeof IS_WEB == 'undefined') {

            ConfigOptions = require('../../lib/Config')
            if (ConfigOptions.options.fullVideoControls) {
                attrs.controls = true
            }
        }

        return (
            <span className="videos">
                {this.state.sharing ? <ShareHighlightsModal at={this.props.at} game={this.props.game} highlight={this.props.path} title={this.props.caption} close={() => this.setState({ sharing: false })} /> : null}
                <highlight-reel onClick={this.toggleVideo.bind(this)}>
                
                    <div className="video-options">
                        {!ConfigOptions.options.fullVideoControls ? <Svg src="download.svg" onClick={this.save.bind(this)} /> : null}
                        <Svg src="share-square.svg" onClick={this.share.bind(this)} />
                    </div>
                    {!this.state.playing && !ConfigOptions.options.fullVideoControls ? <video-controls></video-controls> : null}
                    <video {...attrs} src={this.state.video} />
                </highlight-reel>
            </span>
        )

        return null
    }
}

module.exports = HighlightVideoFile