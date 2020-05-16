const io = require('socket.io-client');
const request = require("request-promise");
const fs = require("fs").promises;
const commands = require('./commands/exports');
const EVENTS = require('./events');

const URL = {
	signIn: 'https://animemusicquiz.com/signIn',
	getToken: 'https://animemusicquiz.com/socketToken',
	socket: 'https://socket.animemusicquiz.com'
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getToken(user, pass, path = 'data.json') {
	try {
		data = await fs.readFile(path, 'utf-8').then(f => JSON.parse(f));
	} catch (e) {
		data = {}
	}

	if (!data.cookie) {
		data.cookie = (await request.post(URL.signIn, {form: {username: user, password: pass}, resolveWithFullResponse: true})).headers['set-cookie']
	}

	data.token = await request.get(URL.getToken, {headers: {'Cookie': data.cookie}})
	
	await fs.writeFile(path, JSON.stringify(data));

	return JSON.parse(data.token);
}

class Listener {
	constructor(eventName, callback, value, socket) {
		this.eventName = eventName;
		this.callback = callback;
		this.socket = socket;
		this.value = value;
	}

	destroy() {
		this.socket.destroy(this);
	}
}


class SocketWrapper {
	constructor() {
		this.listeners = {};
		this.dependencies = {
			room: 0,
			leaderboards: 0,
			expand: 0,
			online: 0
		}

		this.social = new commands.Social(this);
		this.roomBrowser = new commands.RoomBrowser(this);
		this.expand = new commands.Expand(this);
		this.avatar = new commands.Avatar(this);
		this.quiz = new commands.Quiz(this);
		this.lobby = new commands.Lobby(this);
		this.battleRoyal = new commands.BattleRoyal(this);
		this.settings = new commands.Settings(this);
		this.tutorial = new commands.Settings(this);
		this.debug = false;
		this.timeout = 5000;
	}

	connect(token) {
		return new Promise((resolve, reject) => {
			this.socket = io.connect(URL.socket + ":" + token.port , {
								reconnection: true,
								reconnectionDelay: 1000,
								reconnectionDelayMax: 2000,
								reconnectionAttempts: 3,
								query: {
									token: token.token
								}
							});
			this.socket.on('sessionId', (sessionId) => {
				this.sessionId = sessionId;
				resolve(this);
			});		

			this.socket.on("disconnect", () => {
				console.log("Disconnected from server", "Attempting to reconnect.");
			});

			this.socket.on('reconnect', () => {
				console.log("reconnect: " + this.sessionId, "Successfully  Reconnected");
			});

			this.socket.on('reconnect_failed', () => {
				console.log("Unable to Reconnect", "Unable to reconnect to the server");
			});

			this.socket.on('reconnect_attempt', () => {
				console.log("Attempting to reconnect: " + this.sessionId);
				this.socket.io.opts.query = {
					session: this.sessionId
				};
			});

			this.socket.on("error", console.log)
			this.socket.on("connect_error", console.log)

			this.socket.on('command', this._processCommand.bind(this));
		})
	}

	disconnect() {
		this.socket.disconnect()
	}

	on(eventName, callback, value) {
		if (!this.listeners[eventName]) this.listeners[eventName] = [];
		let listener = new Listener(eventName, callback, value, this);
		this.listeners[eventName].push(listener)
		this._checkDependencies(eventName);
		return listener;
	}

	once(eventName, value) {
		return new Promise((resolve, reject) => {
			this.on(eventName, (data, listener) => {
				listener.destroy();
				resolve(data.data);
			}, value)

			setTimeout(() => reject('timeout'), this.timeout);
		})
	}

	destroy(listener) {
		let arr = this.listeners[listener.eventName];
		let index = arr.indexOf(listener);
		
		if (index != -1) {
			 this.listeners[listener.eventName] = arr.splice(index, 1);
		}

		this._removeDependencies(listener.eventName);
	}

	_sendCommand(data, responseEvent, value) {
		let promise = this.once(responseEvent, value); 
		this.socket.emit("command", data);
		return promise;
	}

	_processCommand(data) {
		if (this.debug) console.log(data);

		(this.listeners[data.command] || []).concat(this.listeners[EVENTS.ALL] || []).forEach(listener => listener.callback(data.data, listener, data));
		
	}

	_startLeaderBoardListeners() {
		this.socket.emit("command", {"type":"social","command":"get leaderboard level entries"});
	}

	_stopLeaderBoardListeners() {
		this.socket.emit("command", {"type":"social","command":"stop leaderboard listning"});

	}

	_startRoomListeners() {
		this.socket.emit("command", {"type":"roombrowser","command":"get rooms"});
	}

	_stopRoomListeners() {
		this.socket.emit("command", {"type":"roombrowser","command":"remove roombrowser listners"});		
	}

	_closeExpand() {
		this.socket.emit("command", {"type":"library","command":"expandLibrary closed"});				
	}

	_stopTrackingOnlineUsers() {
		this.socket.emit("command", {"type":"social","command":"stop tracking online users"});					
	}

	_checkDependencies(eventName) {
		if (eventName == EVENTS.LEADERBOARD) {
			if (this.dependencies.leaderboards++ == 0) this._startLeaderBoardListeners();
		} else if (eventName == EVENTS.ROOM_CHANGE || eventName == EVENTS.NEW_ROOMS) {
			if (this.dependencies.rooms++ == 0) this._startRoomListeners();
		} else if (eventName == EVENTS.EXPAND_QUESTIONS) {
			this.dependencies.expand++;
		} else if (eventName == EVENTS.ALL_ONLINE_USERS) {
			this.dependencies.online++;
		}
	}

	_removeDependencies(eventName) {
		if (eventName == EVENTS.LEADERBOARD) {
			if (--this.dependencies.leaderboards == 0) this._stopLeaderBoardListeners();
		} else if (eventName == EVENTS.ROOM_CHANGE || eventName == EVENTS.NEW_ROOMS) {
			if (--this.dependencies.rooms == 0) this._stopLeaderBoardListeners();
		} else if (eventName == EVENTS.EXPAND_QUESTIONS) {
			if (--this.dependencies.expand == 0) this._closeExpand();
		} else if (eventName == EVENTS.ALL_ONLINE_USERS) {
			if (--this.dependencies.online == 0) this._stopTrackingOnlineUsers();
		}
	}

}


module.exports = {SocketWrapper, getToken, EVENTS, sleep}