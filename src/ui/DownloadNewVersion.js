const React = require('react')
const fs = require('fs')
const http = require('http')
const os = require('os')
const dist = require('../lib/Dist')

class DownloadNewVersion extends React.Component {
    constructor(props) {
        super()
        
        this.fileName = os.platform() == 'win32' ? 'HotSTube Setup.exe' : 'HotSTube Setup.dmg'
    }
    componentDidMount() {
        if (this.isNewVersionDownloaded()) {
            this.installNewVersion()
        } else {
            this.downloadNewVersion()
        }
    }
    installNewVersion() {

    }
    isNewVersionDownloaded() {
        return fs.existsSync(dist.filename) 
    }
    downloadNewVersion() {
        let installer = fs.createWriteStream(dist.filename)

        http.get({
            host: 'hotstube.com',
            path: '/' + encodeURIComponent(dist.filename)
        }, (response) => {
            console.log(response)
            // response.pipe(installer)

            // response.on('end', () => {
            //     console.log('New version downloaded')
            // })
        })
    }
    upgrade() {
        if (!this.isNewVersionDownloaded()) {
            return
        }


    }
    render() {
        console.log('rendered')
        return (
            <download-new-version-popup>
                There is a new version of HotSTube available. 
                <a href={this.upgrade}>Upgrade and restart HotSTube now</a>.
            </download-new-version-popup>
        )
    }
}

module.exports = DownloadNewVersion