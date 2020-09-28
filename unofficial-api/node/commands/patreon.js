const Commands = require('./commands');

class Patreon extends Commands {
	deleteEmoji(emojiId) {
		this._sendCommand({type:"patreon",command:"delete emoji", data: {emojiId}})				
	}
}

module.exports = Patreon;