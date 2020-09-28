const Commands = require('./commands');
const EVENTS = require('../events');

class Patreon extends Commands {
	deleteEmoji(emojiId) {
		this._sendCommand({type:"patreon",command:"delete emoji", data: {emojiId}})				
	}
    
    freeAvatarDonation(donationType, description, avatarSelected, anon, value) {
        //donationType: 1 = existing, 2 = new, 3 = no avatar, just drive
        //description, short description of a new avatar, ignored for 1 and 3
        //avatarSelected, selected avatar for 1 or backup for 2
        //anon: boolean, should name be anonymous?
        //value: size of donation
		return this._sendCommand({type:"avatardrive",command:"free avatar donation", data: {donationType, description, avatarSelected, anon, value}}, EVENTS.FREE_AVATAR_DONATION)				
    }
    
    unlink() {
        this._sendCommand({type:"patreon",command:"unlink patreon"})
    }
    
    requestUpdate() {
        this._sendCommand({type:"patreon",command:"request update"})
    }
}

module.exports = Patreon;