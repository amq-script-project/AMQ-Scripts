const Commands = require('./commands');
const EVENTS = require('../events');

class Social extends Commands {

	constructor(socketWrapper) {
		super(socketWrapper);
		this.profile = new Profile(socketWrapper);
	}

	leaderboards() {
		return this.once(EVENTS.LEADERBOARD);
	}

	onlineUsers() {
		return this._sendCommand({type:"social",command:"get online users"}, EVENTS.ALL_ONLINE_USERS)		
	}

	answerFriendRequest(target, accept) {
		this._sendCommand({type:"social",command:"friend request response", data: {target, accept}})				
	}

	message(target, message) {
		this._sendCommand({type:"social",command:"chat message", data: {target, message}})				
	}

	openChat(target) {
		this._sendCommand({type:"social",command:"opened chat", data: {target}})						
	}

	closeChat(target) {
		this._sendCommand({type:"social",command:"closed chat", data: {target}})								
	}

	invite(target) {
		this._sendCommand({type:"social",command:"invite to game", data: {target}})										
	}

	addFriend(target) {
		this._sendCommand({type:"social",command:"friend request", data: {target}})														
	}

	removeFriend(target) {
		this._sendCommand({type:"social",command:"remove friend", data: {target}})												
	}

	block(target) {
		this._sendCommand({type:"social",command:"block player", data: {target}})														
	}

	unblock(target) {
		this._sendCommand({type:"social",command:"unblock player", data: {target}})																
	}

	report(reportType, reportReason, target) {
		this._sendCommand({type:"social",command:"report player", data: {reportType, reportReason, target}})														
	}

	modStrike(strikeType, reason, target) {
		this._sendCommand({type:"social",command:"mod strike", data: {strikeType, reason, target}})																
	}
}


class Profile extends Commands {
	get(name) {
		return this._sendCommand({type:"social",command:"player profile",data:{name: name}}, EVENTS.PLAYER_PROFILE, name)
	}	

	setImage(avatarImage=undefined, emoteId=undefined) {
		this._sendCommand({type:"social",command:"player profile set image", data: {avatarImage, emoteId}})				
	}

	showBadge(slotNumber, badgeId) {
		this._sendCommand({type:"social",command:"player profile show badge", data: {slotNumber, badgeId}})				
	}

	clearBadge(slotNumber) {
		this._sendCommand({type:"social",command:"player profile clear badge", data: {slotNumber}})						
	}
	
	setChatBadge(badgeId) {
		this._sendCommand({type:"social",command:"player profile set chat badge", data: {badgeId}})								
	}

	clearChatBadge(badgeId) {
		this._sendCommand({type:"social",command:"player profile clear chat badge", data: {badgeId}})								
	}

	toggle(fieldName) {
		this._sendCommand({type:"social",command:"player profile toggle hide", data: {fieldName}})										
	}

	setList(listId) {
		this._sendCommand({type:"social",command:"player profile set list", data: {listId}})												
	}
}

module.exports = Social;