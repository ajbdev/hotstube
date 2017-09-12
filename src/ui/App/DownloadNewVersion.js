const React = require('react')
const fs = require('fs')
const http = require('http')
const os = require('os')
const dist = require('../../lib/Dist')
const pathResolver = require('path')
const {shell} = require('electron')
const {app} = require('electron').remote

class DownloadNewVersion extends React.Component {
    constructor(props) {
        super()
        
        this.state = { newVersionDownloaded: false }
    }
    componentDidMount() {
        if (!this.isNewVersionDownloaded()) {
            this.downloadNewVersion()
        }
    }
    isNewVersionDownloaded() {
        const exists = fs.existsSync(dist.filename())

        this.setState({ newVersionDownloaded: exists })

        return exists
    }
    downloadNewVersion() {
        let installer = fs.createWriteStream(dist.filename())

        http.get({
            host: 'hotstube.com',
            path: '/' + encodeURIComponent(dist.filename())
        }, (response) => {
            response.pipe(installer)

            response.on('end', () => {
                console.log('New version downloaded')

                this.setState({
                    newVersionDownloaded: true
                })
            })
        })
    }
    upgrade() {
        if (this.isNewVersionDownloaded()) {
            shell.openItem(dist.filename())
            app.quit()
        }
    }
    render() {
        if (!this.state.newVersionDownloaded) {
            return null
        }
        return (
            <download-new-version-popup>
                There is a new version of HotSTube available. 
                <a onClick={this.upgrade.bind(this)}>Upgrade and restart HotSTube now</a>.
            </download-new-version-popup>
        )
    }
}

module.exports = DownloadNewVersion