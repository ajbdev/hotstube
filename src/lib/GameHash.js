const crypto = require('crypto')

class GameHash {
    static hash(game) {
        const unhashedString = game.build + ',' 
                             + game.utcTimestamp + ',' 
                             + game.map + ',' 
                             + game.players.map((p) => p.id + ':' + p.teamId).sort().join(',')
    
        return crypto.createHash('md5').update(unhashedString).digest("hex")
    }
}

module.exports = GameHash