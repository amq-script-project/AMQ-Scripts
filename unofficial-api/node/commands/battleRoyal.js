const Commands = require('./commands');
const EVENTS = require('../events');

class BattleRotal extends Commands {
	returnToMap() {
		return this._sendCommand({type:"quiz",command:"battle royal return map"}, EVENTS.BATTLE_ROYAL_RETURN_MAP);												
	}

	executeMove(x, y, deltaTime) {
		this._sendCommand({type:"quiz",command:"battle royal position", data: {x, y, deltaTime}});														
	}

	selectTile(x, y) {
		this._sendCommand({type:"quiz",command:"tile selected", data: {x, y}});																
	}

	selectObject(x, y) {
		this._sendCommand({type:"quiz",command:"object selected", data: {x, y}});																		
	}

	selectEntry(x, y, id) {
		this._sendCommand({type:"quiz",command:"container entry selected", data: {x, y, id}});																		
	}

	changeTile(direction) {
		this._sendCommand({type:"quiz",command:"change tile", data: {direction}});																		
	}

	dropEntry(id) {
		this._sendCommand({type:"quiz",command:"drop entry"}, {id});														
	}	
}

module.exports = BattleRotal;