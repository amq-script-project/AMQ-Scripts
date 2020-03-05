const Commands = require('./commands');
const EVENTS = require('../events');

class RoomBrowser extends Commands {
	host(settings) {
		return this._sendCommand({type:"roombrowser",command:"host room", data: settings}, EVENTS.HOST_GAME)
	}

	join(gameId, password) {
		return this._sendCommand({type:"roombrowser",command:"join game", data: {gameId, password, gameInvite}}, EVENTS.JOIN_GAME);
	}

	spectate(gameId, password, gameInvite) {
		return this._sendCommand({type:"roombrowser",command:"spectate game", data: {gameId, password, gameInvite}}, EVENTS.SPECTATE_GAME);
	}

	rooms() {
		return this.once(EVENTS.NEW_ROOMS);
	}	

	joinRanked() {
		this._sendCommand({type:"roombrowser",command:"join ranked game", data: settings})		
	}
}

module.exports = RoomBrowser;