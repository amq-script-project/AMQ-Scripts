const Commands = require('./commands');
const EVENTS = require('../events');

class Expand extends Commands {
	songs() {
		return this._sendCommand({type:"library",command:"expandLibrary questions"}, EVENTS.EXPAND_QUESTIONS);
	}

	submitAnswer(annId, annSongId, url, resolution) {
		return this._sendCommand({type:"library",command:"expandLibrary answer", data: {annId, annSongId, url, resolution}}, EVENTS.EXPAND_ANSWER);										
	}
} 


module.exports = Expand;