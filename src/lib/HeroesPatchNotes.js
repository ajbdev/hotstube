
const download = require("download-github-repo");
const path = require('path')
const app = require('electron').remote.app
const fs = require('fs-extra')
const Config = require('./Config')
const request = require('request')

class HeroesPatchNotes {
    static get cachedHeroes() {
        if (!HeroesPatchNotes.cache) {
            HeroesPatchNotes.cache = {}
        }
        return HeroesPatchNotes.cache
    }

    static get path() {
        return path.join(app.getPath('appData'), 'HotSTube', 'heroes')
    }
    
    static checkAndDownload() { 
        return new Promise((resolve, reject) => {
            
            const repoCommitHistoryUrl = 'https://api.github.com/repos/heroespatchnotes/heroes-talents/commits'
            let headers = {'User-Agent': 'HotSTube v' + app.getVersion()}

            request(repoCommitHistoryUrl,{ headers: headers }, (err, response, body) => {
                if (err) {
                    console.log(err)
                    reject(err)
                }

                const lastCommit = JSON.parse(body).shift()

                if (!Config.options.lastHeroesPatchNotesCommitHash || Config.options.lastHeroesPatchNotesCommitHash != lastCommit.sha) {
                    HeroesPatchNotes.downloadRepository().then(() => {
                        Config.options.lastHeroesPatchNotesCommitHash = lastCommit.sha
                        Config.save()
                        resolve()
                    })
                } else {
                    // Up to date, nothing to do
                    resolve()
                }
            })
        })
    }

    static downloadRepository() {
        const repository = 'heroespatchnotes/heroes-talents'
        return new Promise((resolve, reject) => {
            fs.mkdirp(HeroesPatchNotes.path, err => { if (err) { reject(err) } })

            console.log('Downloading ' + repository)

            download(repository, HeroesPatchNotes.path, err => {
                if (!err) {
                    Config.options.lastHeroPatchesDownload = (new Date()).getTime()
                    Config.save()
                    resolve()
                } else {
                    console.error("Error downloading https://github.com/" + repository);
                    console.log(err)
                    reject(err)
                }
            })
        })
    }

    static hero(name) {
        return new Promise((resolve, reject) => {
            let hit = HeroesPatchNotes.cachedHeroes[name]
            if (hit) {
                resolve(hit)
            }

            const dataPath = path.join(HeroesPatchNotes.path,'hero',name + '.json')
            const imgPath = path.join(HeroesPatchNotes.path,'images','heroes',name + '.png')

            const getHero = () => {
                fs.readFile(dataPath, (err, data) => {
                    if (err) {
                        reject(err)
                    }
                    let hero = {}
                    try {
                        hero = JSON.parse(data)

                    } catch(ex) {
                        reject(ex)
                    }
                    fs.readFile(imgPath, (err, data) => {
                        if (err) {
                            reject(err)
                        }
                        let buffer = new Buffer(data)
                        let arrayBuffer = new Uint8Array(buffer).buffer
                        let blob = new Blob([arrayBuffer])
                        let url = URL.createObjectURL(blob)

                        hero.image = url

                        HeroesPatchNotes.cache[name] = hero
                        resolve(hero)
                    })
                })
            }

            if (!fs.existsSync(dataPath) || !fs.existsSync(imgPath)) {
                reject('Hero does not exist')
            } else {
                getHero()
            }
        })
    }
}

module.exports = HeroesPatchNotes