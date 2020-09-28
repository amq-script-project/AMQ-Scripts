const Commands = require('./commands');
const EVENTS = require('../events');

class Quiz extends Commands {

	constructor(socketWrapper) {
		super(socketWrapper);
		this.chat = new QuizChat(socketWrapper);
		this.settings = new QuizSettings(socketWrapper);
		this.autocomplete = new AutoComplete(socketWrapper);
	}

	leaveGame() {
		this._sendCommand({type:"lobby",command:"leave game"});												
	}

	videoReady(songId) {
		this._sendCommand({type:"quiz",command:"video ready", data: {songId}});														
	}

	returnToLobby() {
		this._sendCommand({type:"quiz",command:"start return lobby vote"});															
	}

	submitAnswer(answer, isPlaying, volumeAtMax) {
		this._sendCommand({type:"quiz",command:"quiz answer", data: {answer, isPlaying, volumeAtMax}});												
	}

	songFeedback(data) {
		this._sendCommand({type:"quiz",command:"song feedback", data});																
	}

	videoHiddenFeedback(hidden) {
		this._sendCommand({type:"quiz",command:"video hidden feedback", data: {hidden}});	
	}
	
	videoError(songId, host, resolution) {
		this._sendCommand({type:"quiz",command:"video error", data: {songId, host, resolution}});	
	}

	skip(skipVote) {
		this._sendCommand({type:"quiz",command:"skip vote", data: {skipVote}});																
	}

	voteReturn(accept) {
		this._sendCommand({type:"quiz",command:"return lobby vote", data: {accept}});																		
	}
}

class QuizChat extends Commands {
	send(msg, teamMessage=false) {
		this._sendCommand({type:"lobby",command:"game chat message", data: {msg: msg, teamMessage: teamMessage}});																		
	}

	ban(msg) {
		this._sendCommand({type:"lobby",command:"game chat message ban", data: {msg}});																				
	}

	clearBans() {
		this._sendCommand({type:"lobby",command:"game chat clear message ban"});																						
	}
}

class QuizSettings extends Commands {
	save(name, settingString) {
		return this._sendCommand({type:"settings",command:"save quiz settings", data: {name, settingString}}, EVENTS.SAVE_QUIZ_SETTINGS);																			
	}

	delete(id) {
		this._sendCommand({type:"settings",command:"delete quiz settings", data: {id}});																				
	}
}

class AutoComplete extends Commands {
	songs() {
		return this._sendCommand({type:"quiz",command:"get all song names"}, EVENTS.GET_SONG_NAMES);										
	}

	updateSongs(currentVersion) {
		return this._sendCommand({type:"quiz",command:"update all song names", data: {currentVersion}}, EVENTS.UPDATE_SONG_NAMES);						
	}
}

module.exports = Quiz;
