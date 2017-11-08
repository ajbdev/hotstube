const request = require('request')
const path = require('path')
const app = require('electron').remote.app
const fs = require('fs')

class HotsApi {

    static get heroesPath() {
        return path.join(app.getPath('appData'), 'HotSTube','heroes.json')
    }

    static get url() {
        return 'http://hotsapi.net/api/v1'
    }

    static hero(name) {
        return new Promise((resolve, reject) => {
            const readHeroData = () => {
                try {
                    if (!HotsApi.heroes) {
                        HotsApi.heroes = JSON.parse(fs.readFileSync(HotsApi.heroesPath))
                    }
                    const hero = HotsApi.heroes.filter((h) => h.name.toLowerCase() == name)[0]
    
                    if (hero) {
                        resolve(hero)
                    }
                    reject('Hero ' + name + ' not found')
                } catch(ex) {

                    reject('Problem parsing heroes JSON: ' + ex)
                }
            }

            if (!fs.existsSync(HotsApi.heroesPath)) {
                HotsApi.updateHeroes().then(() => {
                    readHeroData()
                }, (err) => {
                    reject()
                })
            } else {
                readHeroData()
            }
        })
    }

    static updateHeroes() {
        const heroesJson = HotsApi.heroesPath

        console.log('Downloading new heroes.json')
        return new Promise((resolve, reject) => {
            request({ 
                url: HotsApi.url + '/heroes',
                method: 'GET',
            }, (err, resp) => {
                if (resp.statusCode == 200 || resp.statusCode == 201) {
                    fs.writeFile(heroesJson, resp.body, 'utf8', (err) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve()
                        }
                    })
                } else {
                    reject('heroes.json could not be downloaded')
                }
            })
        })
    }

    static upload(replay) {
        return new Promise((resolve, reject) => {
            request({
                url: HotsApi.url + '/replays',
                method: 'POST',
                formData: {
                    file: fs.createReadStream(replay),
                }
            }, (err, resp) => {
                if (resp.statusCode == 200 || resp.statusCode == 201) {
                    return resolve(resp.body)
                }
                reject()
            })
        })
        
    }
}

module.exports = HotsApi