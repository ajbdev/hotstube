const heroes = require('../data/heroes.json')

class Talents {
    get(hero, slots = []) {
        const talents = []
        heroes.map((h) => {
            if (h.name.toLowerCase() == hero.toLowerCase()) {

                slots.map((choice, ix) => {
                    let tier = ix + 1

                    h.talents.map((t) => {
                        if (t.choice == choice && t.tier == tier) {
                            talents.push(t)
                        }
                    })
                })

            }
        })
        return talents
    }
}

module.exports = new Talents