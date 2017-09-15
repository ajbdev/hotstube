const ShareHighlightsModal = require('./ShareHighlightsModal')
const Svg = require('../App/Svg')

class HighlightClip extends React.Component { 
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
    save(video) {
        let self = this

        dialog.showSaveDialog({
            title: 'Save highlight',
            buttonLabel: 'Save',
            showsTagField: false,
            defaultPath: app.getPath('documents') + '/' + this.props.caption + '.gifv',
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
    
                    output.on('finish', () => {
                        self.props.setStatus('Highlight saved')
                    })
    
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

        if (typeof IS_WEB !== 'undefined' && IS_WEB) {
            return
        }

        if (!props.path) {
            return
        }

        const fs = require('fs')

        let videoData = 'data:video/webm;base64,' + new Buffer(fs.readFileSync(props.path)).toString('base64')

        this.setState({
            video: videoData
        })
    }

    share() {
        this.setState({ sharing: true })
    }

    renderFile() {

        if (!this.state.video) {
            return null
        }

        let attrs = {
            width: 640,
            ref: (video) => { this.video = video }
        }

        const ConfigOptions = require('../../lib/Config')
        if (ConfigOptions.options.fullVideoControls) {
            attrs.controls = true
        }

        return (
            <span>
                {this.state.sharing ? <ShareHighlightsModal highlight={this.props.path} title={this.props.caption} close={() => this.setState({ sharing: false })} /> : null}
                <highlight-reel onClick={this.toggleVideo.bind(this)}>
                    {!this.state.playing && !ConfigOptions.options.fullVideoControls ? <video-controls></video-controls> : null}
                    <video {...attrs} src={this.state.video} />
                </highlight-reel>
                <div className="video-options">
                    {!ConfigOptions.options.fullVideoControls ? <Svg src="download.svg" onClick={() => this.save(props.path)} /> : null}
                    <Svg src="share-square.svg" onClick={this.share.bind(this)} />
                </div>
            </span>
        )

        return null
    }

    renderEmbeddedVideo() {
        return null
    }

    render() {        
        if (typeof IS_WEB !== 'undefined' && IS_WEB) {
            return this.renderEmbeddedVideo()
        }

        return this.renderFile()
    }
}

module.exports = HighlightClip