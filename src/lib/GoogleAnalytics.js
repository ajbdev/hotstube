const Analytics = require('electron-google-analytics')
const Config = require('./Config')
const uuidv4 = require('uuid/v4');

if (!Config.options.uuid) {
    Config.options.uuid = uuidv4()
    Config.save()
}

const ga = new Analytics.default('UA-108874757-2')

const analytics = {
    page: (label, path) =>  {
        if (!Config.options.enableAnalytics) {
            return
        }

        return ga.pageview('http://hotstube.local', path, label, Config.options.uuid)
    },
    event: (category, action, label = null, value = null) => {
        if (!Config.options.enableAnalytics) {
            return
        }
        
        return ga.event(category, action, { evLabel: label, evValue: value, clientId: Config.options.uuid})
    }
}


module.exports = analytics