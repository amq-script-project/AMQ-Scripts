class Commands {
	constructor(socketWrapper) {
		this.socketWrapper = socketWrapper;
	}	

	_sendCommand(...args) {
		if (args.length == 1) return this.socketWrapper.socket.emit("command", args[0]);
		return this.socketWrapper._sendCommand(...args);
	}

	once(...args) {
		return this.socketWrapper.once(...args);
	}
}

module.exports = Commands;