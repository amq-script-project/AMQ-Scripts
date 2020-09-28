const Commands = require('./commands');

class Settings extends Commands {
	_updateAnimeList(newUsername, listType) {
		this._sendCommand({type:"library",command:"update anime list", data: {newUsername, listType}})										
	}

	updateMyAnimeList(newUsername) {
		this._updateAnimeList(newUsername, 'MAL')
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

	_updateListInclusion(listStatus, on) {
		this._sendCommand({type:"settings",command:"update use list entry " + listStatus, data: {on}})
	}

	updateIncludeWatching(on) {
		this._updateListInclusion("watching", on)
	}
	
	updateIncludeCompleted(on) {
		this._updateListInclusion("completed", on)
	}
	
	updateIncludeOnHold(on) {
		this._updateListInclusion("on hold", on)
	}
	
	updateIncludeDropped(on) {
		this._updateListInclusion("dropped", on)
	}
	
	updateIncludePlanning(on) {
		this._updateListInclusion("planning", on)
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
	
	updateAutoSwitchFavoritedAvatars(switchState) {
		this._sendCommand({type:"settings",command:"update auto switch avatars", data: {switchState}})																				
	}

	sendGameState(inGame, inExpand, inMain) {
		this._sendCommand({type:"settings",command:"update auto switch avatars", data: {inGame, inExpand, inMain}})
	}

	guestRegistration(username, password, email, country) {
		this._sendCommand({type:"settings",command:"guest registration", data: {username, password, email, country}})
	}
}

module.exports = Settings;