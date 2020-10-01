const Commands = require('./commands');
const LobbySettings = require('./lobbySettings')
const EVENTS = require('../events');

class RoomBrowser extends Commands {
	host(settings, doNotValidate=false) {
		let command
		if(doNotValidate){
			command = "host room"
		}else{
			LobbySettings().validate(settings)
			command = settings.gameMode === "Solo" ? "host solo room" : "host room"
		}
		return this._sendCommand({type:"roombrowser",command, data: settings}, EVENTS.HOST_GAME)
	}

	join(gameId, password) {
		return this._sendCommand({type:"roombrowser",command:"join game", data: {gameId, password}}, EVENTS.JOIN_GAME);
	}

	spectate(gameId, password, gameInvite) {
		return this._sendCommand({type:"roombrowser",command:"spectate game", data: {gameId, password, gameInvite}}, EVENTS.SPECTATE_GAME);
	}

	rooms() {
		return this.once(EVENTS.NEW_ROOMS);
	}	

	joinRanked() {
		this._sendCommand({type:"roombrowser",command:"join ranked game"})		
	}

	getNewLobbySettings(override) {
		return new LobbySettings(override)
	}
}

module.exports = RoomBrowser;