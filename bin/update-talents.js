const request = require('request')
const fs = require('fs')

let apiRoot = 'https://api.masterleague.net'
let user = 'api-i5sq'
let password = 'P3dRXs6aurEUXirEAoan'

function auth() {
    return new Promise((resolve, reject) => {
        request.post({ 
            url: apiRoot + '/auth/token/',
            form: { username: user, password: password } 
        }, (err, resp, body) => {
            try {
                resolve(JSON.parse(body).token)
            } catch(ex) {
                reject(ex)
            }
        })
    })
}

function heroes(token) {
    let collection = []

    return new Promise((resolve, reject) => {
        let page = (url) => {
            request.get({ 
                url: url,
                headers: { Authorization: token }
             }, (err, resp, body) => {
                let results = JSON.parse(body)
                collection = collection.concat(results.results)
        
                if (results.next) {
                    page(results.next)
                }

                if (!results.next) {
                    resolve(collection)
                }
            })
        }

        page(apiRoot + '/heroes.json')
    })
    

    // return new Promise((resolve, reject) => {
    //     request.get({
    //         url: apiRoot + '/heroes'
    //     })
    // })
}

function hero(token, id) {
    return new Promise((resolve, reject) => {
        request.get({
            url: apiRoot + '/heroes/' + id + '.json',
            headers: { Authorization: token }
        }, (err, resp, body) => {
            let results = JSON.parse(body)
            resolve(results)
        })
    })    
}

auth().then((token) => {
    console.log('Token is ' + token)
    console.log('Getting hero list')

    let roster = []
    heroes(token).then((results) => {
        const nextHero = () => {
            let current = results.shift()

            console.log('Fetching ' + current.name)

            hero(token, current.id).then((hero) => {
                if (hero.details) {
                    console.log(hero.details)
                }
                roster.push(hero)

                if (results.length > 0) {
                    setTimeout(() => {
                        nextHero()
                    }, 1000)
                    
                } else {
                    fs.writeFile(__dirname+ '/../src/data/heroes.json', JSON.stringify(roster), (err, results) => {}); 
                }
            })
        }
        nextHero()
    })
})