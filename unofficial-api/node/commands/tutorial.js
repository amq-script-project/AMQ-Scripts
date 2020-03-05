const Commands = require('./commands');

class Tutorial extends Commands {
	skip() {
		this._sendCommand({type:"tutorial",command:"tutorial skipped", data: settings})				
	}

	complete() {
		this._sendCommand({type:"tutorial",command:"completed tutorial", data: settings})						
	}
}

module.exports = Tutorial;