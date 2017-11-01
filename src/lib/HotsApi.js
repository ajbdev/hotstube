const request = require('request')

class HotsApi {
    constructor() {
        this.url = 'http://hotsapi.net/api/v1'
    }

    upload(replay) {
        return new Promise((resolve, reject) => {
            request({
                url: this.url + '/replays',
                method: 'POST',
                formData: {
                    file: fs.createReadStream(replay),
                }
            }, (err, resp) => {
                if (resp.statusCode == 200 || resp.statusCode == 201) {
                    return resolve()
                }
                reject()
            })
        })
        
    }
}