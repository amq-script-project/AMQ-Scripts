const Commands = require('./commands');

class Settings extends Commands {
	_updateAnimeList(newUsername, listType) {
		this._sendCommand({type:"library",command:"update anime list", data: {newUsername, listType}})										
	}

	updateAniList(newUsername) {
		this._updateAnimeList(newUsername, 'ANILIST')
	}

	updateKitsu(newUsername) {
		this._updateAnimeList(newUsername, 'KITSU')		
	}

	updateShareMal(shareMal) {
		this._sendCommand({type:"settings",command:"update share mal", data: {shareMal}})												
	}

	updateShareScore(shareScore) {
		this._sendCommand({type:"settings",command:"update share score", data: {shareScore}})														
	}

	updateAutoSubmit(autoSubmit) {
		this._sendCommand({type:"settings",command:"update auto submit", data: {autoSubmit}})														
	}

	updateAutoSkipGuess(autoVote) {
		this._sendCommand({type:"settings",command:"update auto vote skip guess", data: {autoVote}})																
	}

	updateAutoSkipReplay(autoVote) {
		this._sendCommand({type:"settings",command:"update auto vote skip replay", data: {autoVote}})																		
	}

	updateDisableEmojis(disable) {
		this._sendCommand({type:"settings",command:"update disable emojis", data: {disable}})																				
	}

	updateUseRomajiNames(use) {
		this._sendCommand({type:"settings",command:"update use romaji names", data: {use}})																				
	}
}

module.exports = Settings;