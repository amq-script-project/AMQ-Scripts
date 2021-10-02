// ==UserScript==
// @name         AMQ Invite URL
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  Let's you send a link to your friends to join a room if they also have this script
// @author       Zolhungaj
// @match        https://animemusicquiz.com/*
// @downloadURL  https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqInviteURL.user.js
// @updateURL    https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqInviteURL.user.js
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.deleteValue
// ==/UserScript==
"use strict"
const saveSpaceKey = "amqInviteURL"
const roomIDKey = "roomID"
const roomPasswordKey = "roomPassword"
const tileID = "amqInviteTile"


const getInvite = () => {
    const temp = document.URL.split("?")
    if(temp.length < 2){
        return
    }
    const searchQuery = "?" + temp[1]
    const params = new URLSearchParams(searchQuery)
    console.log(params)
    console.log(params.has(saveSpaceKey))
    console.log(params.get(roomPasswordKey))
    console.log(params.get(roomIDKey))
    if(params.has(saveSpaceKey)){
        const roomPassword = params.get(roomPasswordKey)
        const roomID = Number.parseInt(params.get(roomIDKey))
        GM.setValue(saveSpaceKey, true)
        GM.setValue(roomIDKey, roomID)
        if(roomPassword){
            GM.setValue(roomPasswordKey, roomPassword)
        }
    }
}

getInvite()

if (typeof(Listener) === "undefined") {
    return
}

const checkInvite = async () => {
    const exists = await GM.getValue(saveSpaceKey, false)
    console.log(exists)
    if(exists){
        console.log("yo it exists bro")
        const roomID = await GM.getValue(roomIDKey)
        const roomPassword = await GM.getValue(roomPasswordKey)
        console.log(roomID)
        console.log(roomPassword)
        clear()
        spawnInviteModal(roomID, roomPassword)
    }
}





class RoomBrowserSurrogate{
    constructor(){
        this.activeRooms = []
        this.element = document.createElement("div")
        new Listener("New Rooms", (rooms) => {
            rooms.forEach(room => {
                this.activeRooms[room.id] = room
            })
        
        }).bindListener()
    }

    removeRoomTile(tileId){
        delete this.activeRooms[tileId]
    }

    appendRoomTile(tileHtml){
        let newChild = document.createRange().createContextualFragment(tileHtml)
        document.getElementById(tileID).appendChild(newChild)
    }
    
}

const rbSurrogate = new RoomBrowserSurrogate()

const spawnInviteModal = async (roomID, roomPassword) => {
    const ROOM_TILE_TEMPLATE = document.getElementById("rbRoomTileTemplate").innerHTML

    let room = rbSurrogate.activeRooms[roomID]

    if(!room){
        socket.sendCommand({
            type: "roombrowser",
            command: "get rooms"
        })
        await wait(8000)
        room = rbSurrogate.activeRooms[roomID]
        if(!room){
            console.error(`roomID ${roomID} does not correspond to an existing room`)
            return
        }
    }
    

    swal({
		title: "Received invite",
		html : `<div id="${tileID}"></div>`,		
        showCancelButton: true,
		showCloseButton: true,
		confirmButtonText: "Join",
		cancelButtonText: "Spectate"
	}).then(
		(result) => {
            if(result.dismiss === "close"){}
			else if (result.dismiss === "cancel") {
				roomBrowser.fireSpectateGame(roomID, roomPassword)
			}else{
                roomBrowser.fireJoinLobby(roomID, roomPassword)
            }
		},
		() => {} //catch any rejection
	);

    new RoomTile(room.settings, room.host, room.hostAvatar, room.id, room.numberOfPlayers, room.numberOfSpectators, room.players, room.inLobby, rbSurrogate, room.songLeft, false, $("#rbRoomHider"))
    document.getElementById(tileID).getElementsByClassName("hidden")[0].classList.remove("hidden")
}

const clear = () => {
    [saveSpaceKey, roomIDKey, roomPasswordKey]
        .forEach(e => {GM.deleteValue(e)})
}

const createInviteURL = (roomID, password=null) => {
    if(!Number.isInteger(roomID)){
        return ""
    }
    const baseURL = "https://animemusicquiz.com/?"
    let searchParams = `${saveSpaceKey}=1&${roomIDKey}=${roomID}`
    if(password){
        password = encodeURIComponent(password)
        searchParams += `&${roomPasswordKey}=${password}`
    }
    return baseURL + searchParams
}

const wait = (timeMs) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => { resolve() }, timeMs)
    })
}
setTimeout(() => {
    setInterval(() => {
        console.log("yo")
        checkInvite()
    }, 3000);
}, 10000);
