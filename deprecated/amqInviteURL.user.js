// ==UserScript==
// @name         AMQ Invite URL
// @namespace    http://tampermonkey.net/
// @version      1.0
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

const PASSWORD_MAX_LENGTH = 50

const inviteTypeEnum = {
    ROOM_INVITE: 1,
    ROOM_INVITE_SPECTATOR_ONLY: 2,
    ROOM_INVITE_PLAYER_ONLY: 3,
    ROOM_SHOWCASE: 4
}


const getInvite = () => {
    const temp = document.URL.split("?")
    if(temp.length < 2){
        return
    }
    const searchQuery = "?" + temp[1]
    const params = new URLSearchParams(searchQuery)
    if(params.has(saveSpaceKey)){
        const inviteType = Number.parseInt(params.get(saveSpaceKey))
        const roomPassword = params.get(roomPasswordKey)
                ?.substring(0,PASSWORD_MAX_LENGTH) //prevents injection of excessive amounts of data
        const roomID = Number.parseInt(params.get(roomIDKey))
        GM.setValue(saveSpaceKey, inviteType)
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
    const inviteType = await GM.getValue(saveSpaceKey, 0)
    if(inviteType){
        const roomID = await GM.getValue(roomIDKey)
        const roomPassword = await GM.getValue(roomPasswordKey)
        clear()
        spawnInviteModal(roomID, roomPassword, inviteType)
    }
}





class RoomBrowserSurrogate{
    constructor(){
        this.activeRooms = []
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

const spawnInviteModal = async (roomID, roomPassword, inviteType) => {
    const ROOM_TILE_TEMPLATE = document.getElementById("rbRoomTileTemplate").innerHTML

    let room = rbSurrogate.activeRooms[roomID]

    if(!room){
        await new Promise((resolve, reject) => {
            
            const a = new Listener("New Rooms", (rooms) => {
                a.unbindListener()
                resolve()
            })
            a.bindListener()
            socket.sendCommand({
                type: "roombrowser",
                command: "get rooms"
            })
        })
        room = rbSurrogate.activeRooms[roomID]
        if(!room){
            console.error(`roomID ${roomID} does not correspond to an existing room`)
            return
        }
    }
    const spectateOnly = (result) => {
        if(result.dismiss){}
        else{
            roomBrowser.fireSpectateGame(roomID, roomPassword)
        }
    }

    const joinOnly = (result) => {
        if(result.dismiss){}
        else{
            roomBrowser.fireJoinLobby(roomID, roomPassword)
        }
    }

    const showCase = (result) => {

    }

    const joinOrSpectate = (result) => {
        if(result.dismiss === "close"){}
        else if (result.dismiss === "cancel") {
            roomBrowser.fireSpectateGame(roomID, roomPassword)
        }else{
            roomBrowser.fireJoinLobby(roomID, roomPassword)
        }
    }

    let thenFunction = (result) => {}

    const swalObject = {
        title: "Received invite ",
        html : `<div id="${tileID}"></div>`,
        showCancelButton: true,
        showCloseButton: true,
    }

    switch(inviteType){
        case inviteTypeEnum.ROOM_INVITE:
            thenFunction = joinOrSpectate
            swalObject.title += "to join"
            swalObject.confirmButtonText = "Join"
            swalObject.cancelButtonText = "Spectate"
            break
        case inviteTypeEnum.ROOM_INVITE_SPECTATOR_ONLY:
            thenFunction = spectateOnly
            swalObject.title += "to spectate"
            swalObject.confirmButtonText = "Spectate"
            swalObject.cancelButtonText = "Cancel"
            break
        case inviteTypeEnum.ROOM_INVITE_PLAYER_ONLY:
            thenFunction = joinOnly
            swalObject.title += "to play"
            swalObject.confirmButtonText = "Join"
            swalObject.cancelButtonText = "Cancel"
            break
        case inviteTypeEnum.ROOM_SHOWCASE:
            thenFunction = showCase
            swalObject.title = "Room showcase"
            swalObject.showCancelButton = false
            swalObject.confirmButtonText = "Close"
            break
        default:
            swalObject.title = "INVALID INVITE TYPE"
    }
    

    swal(swalObject).then(
        thenFunction,
        () => {} //catch any rejection
    );

    new RoomTile(room.settings, room.host, room.hostAvatar, room.id, room.numberOfPlayers, room.numberOfSpectators, room.players, room.inLobby, rbSurrogate, room.songLeft, false, $("#rbRoomHider"))
    document.getElementById(tileID).getElementsByClassName("hidden")[0].classList.remove("hidden")
}

const clear = () => {
    [saveSpaceKey, roomIDKey, roomPasswordKey]
        .forEach(e => {GM.deleteValue(e)})
}

const createInviteURL = (roomID, password=null, inviteType=1) => {
    if(!Number.isInteger(roomID)){
        return ""
    }
    const baseURL = "https://animemusicquiz.com/?"
    let searchParams = `${saveSpaceKey}=${inviteType}&${roomIDKey}=${roomID}`
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

let blocked = false

setInterval(async () => {
    if(!setupDocumentDone){
        return
    }
    if(blocked){
        return
    }
    blocked = true
    await checkInvite()
    blocked = false
}, 1000);

const style = document.createElement("style")
document.head.append(style)
const styleSheet = style.sheet

styleSheet.insertRule(`
    #swal2-content > #amqInviteTile {
        color: #d9d9d9;
    }
`)

//add button to invite spectators while in game
function addButtons() { //stolen from https://github.com/YokipiPublic/AMQ/blob/master/FTFRemoteUpdate.user.js
    const shareButton = $(`<div id="shareButtonIngame" class="clickAble qpOption"><i aria-hidden="true" class="fa fa-share-square-o qpMenuItem"></i></div>`)
        .click(function () {
            swal({
                title: "Invite URL",
                html : `<a>${createInviteURL(lobby.gameId, lobby.settings.password, inviteTypeEnum.ROOM_INVITE_SPECTATOR_ONLY)}</a>`,
            })
        })
        .popover({
            placement: "bottom",
            content: "Get invite link",
            trigger: "hover"
        });
  
    let oldWidth = $("#qpOptionContainer").width();
    $("#qpOptionContainer").width(oldWidth + 35);
    $("#qpOptionContainer > div").append(shareButton);

    const lobbyButton = $(`
        <div id="shareButtonLobby" class="clickAble topMenuButton topMenuMediumButton" onclick="">
            <h3 id="shareButtonLobbyInner" class="clickAble qpOption"><i aria-hidden="true" class="fa fa-share-square-o qpMenuItem"></i></h3>
        </div>
    `)
        .click(function () {
            swal({
                title: "Invite URL",
                html : `<a>${createInviteURL(lobby.gameId, lobby.settings.password, inviteTypeEnum.ROOM_INVITE)}</a>`,
            })
        })
        .popover({
            placement: "bottom",
            content: "Get invite link",
            trigger: "hover"
        });
    $("#lobbyPage > .topMenuBar").append(lobbyButton)
    styleSheet.insertRule(`
        #shareButtonLobby{
            right: calc(89% - 150px);
            padding-left: 0.2%;
            width: 3.2%;
        }
    `)
}
addButtons()