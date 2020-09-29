const Commands = require('./commands');
const EVENTS = require('../events');

class Lobby extends Commands {
	flag(type, targetName, messageId) {
		//type: 1=spam, 2=spoiling/hinting, 3=offsensive message
		this._sendCommand({type:"lobby",command:"instant mod flag", data: {type, targetName, messageId}});																
	}

	kick(playerName) {
		this._sendCommand({type:"lobby",command:"kick player", data: {playerName}});																		
	}

	leaveQueue() {
		return this._sendCommand({type:"lobby",command:"leave game queue"}, EVENTS.LEAVE_GAME_QUEUE);														
	}

	joinQueue() {
		return this._sendCommand({type:"lobby",command:"join game queue"}, EVENTS.JOIN_GAME_QUEUE);														
	}
	
	leaveTeam() {
		this._sendCommand({type:"lobby",command:"leave team"});
	}

	joinTeam(teamNumber) {
		this._sendCommand({type:"lobby",command:"join team", data: {teamNumber}});
	}

	shuffleTeams() {
		this._sendCommand({type:"lobby",command:"shuffle teams"});
	}

	leaveGame() {
		this._sendCommand({type:"lobby",command:"leave game"});
	}

	hostAfk() {
		this._sendCommand({type:"lobby",command:"host afk"});
	}

	changeSettings(data) {
		this._sendCommand({type:"lobby",command:"change game settings", data});																		
	}

	changeToSpectator(playerName) {
		this._sendCommand({type:"lobby",command:"change player to spectator", data: {playerName}});																				
	}

	promoteHost(playerName) {
		this._sendCommand({type:"lobby",command:"promote host", data: {playerName}});																						
	}

	changeToPlayer() {
		this._sendCommand({type:"lobby",command:"change to player"});														
	}

	start() {
		this._sendCommand({type:"lobby",command:"start game"});														
	}

	setReady(ready) {
		this._sendCommand({type:"lobby",command:"set ready", data: {ready}});																								
	}
}

module.exports = Lobby;