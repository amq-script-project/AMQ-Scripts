// ==UserScript==
// @name         AMQ Show Alt or Original Name
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Makes you able to see the original name (or alt name) of a player, incompatible with Original Name
// @author       Zolhungaj
// @match        https://animemusicquiz.com/*
// @downloadURL  https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqShowOriginalOrAlt.user.js
// @updateURL    https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqShowOriginalOrAlt.user.js
// @require      https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqGetOriginalNameUtility.user.js
// @require      https://github.com/joske2865/AMQ-Scripts/raw/master/common/amqScriptInfo.js
// @copyright    MIT license
// @connect      api.zolhungaj.tech
// @grant        GM_xmlhttpRequest
// ==/UserScript==

if (typeof Listener === "undefined") return;

const version = "1.4"
const username = ""
const password = ""
const isAdmin = false

let alwaysShowOriginalName = false
const enableOriginalName = true

const getOriginalNameOrAlt = async (nickname, timeout) => {
    let originalName = await getOriginalName(nickname, timeout)
    let altName = await getAltName(originalName)
    return altName !== "" ? `[${altName}]` : originalName
}

const getAltName = (originalName) => {
    return new Promise((resolve, reject) => {
        const settings = {
            url: `https://api.zolhungaj.tech/amq/alts/${originalName}?fields=mainName,isUnsure${isAdmin ? "&admin=true" : ""}`,
            method: "GET",
            timeout: 5000,
            user: username,
            password: password,
            onload: (response) => {
                if(response.status === 404){
                    resolve("")
                }else if(response.status === 200){
                    const obj = JSON.parse(response.responseText)
                    const mainName = obj["mainName"]
                    const isUnsure = obj["isUnsure"]
                    if(isUnsure){
                        resolve(mainName + "?")
                    }else{
                        resolve(mainName)
                    }
                }else{
                    reject(response)
                }
            }
        };
        GM_xmlhttpRequest(settings)
    })
}

const generateNameString = (nickName, originalName, hasNewLine=false) => {
    //this could be turned into a one-liner, but it would be a very ugly one-liner
    if(!enableOriginalName){
        return nickName
    }else if(alwaysShowOriginalName || nickName !== originalName){
        return nickName + (hasNewLine?"\n":"") + "(" + originalName + ")"
    }else{
        return nickName
    }
}

gameChat._newSpectatorListner = new Listener(
    "New Spectator",
    async function (spectator) {
        spectator.originalName = spectator.name //fallback
        try{
            spectator.originalName = await getOriginalNameOrAlt(spectator.name, 2000)
        }catch(error){
            console.error(`unable to resolve new spectator "${spectator.name}" due to error >${error}`)
        }
        const that = gameChat
        that.addSpectator(spectator)
        if (that.displayJoinLeaveMessages) {
            that.systemMessage(generateNameString(spectator.name, spectator.originalName) + " has started spectating.", "")
        }
    }
)
gameChat._forceSpectatorListner = new Listener(
    "Player Changed To Spectator",
    async function (payload) {
        const that = gameChat
        const playerName = payload.spectatorDescription.name
        let originalName = playerName
        try{
            originalName = await getOriginalNameOrAlt(payload.spectatorDescription.name, 2000)
        }catch (error){
            console.error(`unable to resolve player who changed to spectator "${playerName}" due to error >${error}`)
        }
        payload.spectatorDescription.originalName = originalName
        that.addSpectator(payload.spectatorDescription, payload.isHost)
        if (that.displayJoinLeaveMessages) {
            that.systemMessage(generateNameString(playerName, originalName) + " changed to spectator", "")
        }
        if (selfName === playerName) {
            that.setSpectatorButtonState(false)
            that.setQueueButtonState(true)
        }
    }
)

lobby.oldAddPlayer = lobby.addPlayer
lobby.addPlayer = function(player, teamFullMap){
    const newPlayer = this.oldAddPlayer(player, teamFullMap)
    getOriginalNameOrAlt(newPlayer.name, 2000).then(
        (originalName) => {
            newPlayer.lobbySlot.originalName = originalName
            const that = newPlayer.lobbySlot
            Object.defineProperty(that, "name", {
                get: function() { return that._name },
                set: function(newName){
                    that._name = newName;
                    that.$NAME_CONTAINER.text(generateNameString(newName, that.originalName))
                    if (!that.isSelf) {
                        setTimeout(() => {
                            that.setupAvatarOptions()
                        }, 1)
                    }
                }
            })
            that.name = that.name
        }
    ).catch(e => console.error(`unable to resolve player "${newPlayer.name}" due to error >${e}`))
    return newPlayer
}

lobby._newPlayerListner = new Listener(
    "New Player",
    async function (player) {
        const that = lobby
        const newPlayer = that.addPlayer(player)
        try {
            player.originalName = await getOriginalNameOrAlt(player.name, 2000)
        }catch (error){
            console.error(`unable to resolve player "${player.name}" due to error >${error}`)
            player.originalName = player.name
        }
        newPlayer.originalName = player.originalName
        if (that.displayJoinLeaveMessages) {
            gameChat.systemMessage(generateNameString(newPlayer.name, newPlayer.originalName) + " joined the room.", "")
        }
    }
);

lobby._spectatorChangeToPlayer = new Listener(
    "Spectator Change To Player",
    async function (player) {
        const that = lobby
        player.originalName = player.name //fallback
        const newPlayer = that.addPlayer(player)
        try{
            player.originalName = await getOriginalNameOrAlt(player.name, 2000)
        }catch(error){
            console.error(`unable to resolve spectator who changed to player "${player.name}" due to error >${error}`)
        }
        newPlayer.originalName = player.originalName
        if (that.displayJoinLeaveMessages) {
            gameChat.systemMessage(generateNameString(newPlayer.name, newPlayer.originalName) + " changed to player.", "")
        }
        if (player.name === selfName) {
            that.isSpectator = false;
            that.updateMainButton();
            gameChat.toggleShowTeamChatSwitch(that.numberOfTeams > 0 && that.isHost);
        }
    }
)

quiz.oldSetupQuiz = quiz.setupQuiz
quiz.setupQuiz = function(players, isSpectator, quizState, settings, isHost, groupSlotMap, soloMode, teamAnswers, selfAnswer,champGame, enemies, avatarAssets){
    const that = quiz
    that.oldSetupQuiz(players, isSpectator, quizState, settings, isHost, groupSlotMap, soloMode, teamAnswers, selfAnswer,champGame, enemies, avatarAssets)
    players.forEach((player) => {
        const thePlayer = this.players[player.gamePlayerId]
        getOriginalNameOrAlt(thePlayer.name, 2000).then(
            (originalName) => {
                thePlayer.originalName = originalName
                const that = thePlayer
                Object.defineProperty(that, "name", {
                    get: function() { return that._name },
                    set: function(newName){
                        that._name = newName
                        that.avatarSlot.name = generateNameString(newName, that.originalName, true)
                        that.avatarSlot.updateSize(that.avatarSlot.currentMaxWidth, that.avatarSlot.currentMaxHeight)
                    }
                })
                that.name = that.name
            }
        ).catch(e => console.error(`unable to resolve player "${thePlayer.name}" due to error >${e}`))
    })
}


GameChat.prototype.oldAddSpectator = GameChat.prototype.addSpectator;
GameChat.prototype.addSpectator = function (spectator, isHost) {
    this.oldAddSpectator(spectator, isHost)
    const name = spectator.name
    const item = $("#gcSpectatorItem-" + name)
    const nameField = item.find("h3")
    const adjustName = (originalName) =>{    
        nameField.find("span").text(generateNameString(name, originalName))

        //stolen code start
        let nameWidth = nameField.innerWidth();
        if (!nameWidth) {
            //handle case where spectatorlist is not displayed (nameWidth 0)
            $("#measureBox").append(item.clone());
            nameWidth = $("#measureBox").find("h3").innerWidth();
            $("#measureBox").html("");
            item.find(".gcSpectatorIconContainer").css("width", "calc(100% - 15px - " + nameWidth + "px)");
        } else {
            this.updateSpectatorNameFontSize(name);
        }
        //stolen code end
    }
    if(!spectator.originalName){
        spectator.originalName = getOriginalNameOrAlt(name, 2000).then(adjustName).catch(e => console.error(`unable to resolve spectator "${name}" due to error >${e}`))
    }else{
        adjustName(spectator.originalName)
    }
}

GameChat.prototype.oldAddPlayerToQueue = GameChat.prototype.addPlayerToQueue
GameChat.prototype.addPlayerToQueue = function (name) {
    this.oldAddPlayerToQueue(name) 
    getOriginalNameOrAlt(name, 2000)
        .then(
            (originalName) => {
                this.queueMap[name].find("h3").text(generateNameString(name, originalName))
            })
        .catch(e => console.error(`unable to resolve queued player "${name}" due to error >${e}`))
}

AMQ_addScriptData({
    name: "Show Alt or Original Name",
    author: "Zolhungaj",
    version: version,
    link: "https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqShowOriginalOrAlt.user.js",
    description: `
        <p>Makes you able to see the original name (or alt name) of a player, incompatible with Original Name</p>
    `
})
