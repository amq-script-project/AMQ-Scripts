const Commands = require('./commands');
const EVENTS = require('../events');

class Avatar extends Commands {
	standings() {
		return this._sendCommand({type:"avatardrive",command:"get avatar drive standings"}, EVENTS.AVATAR_DRIVE_STANDINGS);		
	}

	change(avatarId, colorId, optionActive) {
		return this._sendCommand({type:"avatar",command:"use avatar", data: {avatarId, colorId, optionActive}}, EVENTS.USE_AVATAR);				
	}

	unlock(avatarId, colorId) {
		return this._sendCommand({type:"avatar",command:"unlock avatar", data: {avatarId, colorId}}, EVENTS.UNLOCK_AVATAR);						
	}

	patreonUnlock(avatarId) {
		this._sendCommand({type:"patreon",command:"unlock buyable avatar", data: {avatarId}});								
	}

	outfits(avatarId) {
		return this._sendCommand({type:"avatar",command:"get outfit designs", data: {avatarId}}, EVENTS.OUTFIT_DESIGNS);				
	}
}

module.exports = Avatar;