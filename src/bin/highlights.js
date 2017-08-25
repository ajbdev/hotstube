// C:\Users\Andy\Documents\Heroes of the Storm\Accounts\57307676\1-Hero-1-1281664\Replays\Multiplayer\Cursed Hollow (99).StormReplay
// Cursed Hollow (99).StormReplay.webm
const HighlightReel = require('../lib/HighlightReel')

if (!process.argv[3]) {
    console.log("Usage: highlights.js <replay file> <video>")
    process.exit()
}


reel = new HighlightReel(process.argv[2], process.argv[3])
reel.create()