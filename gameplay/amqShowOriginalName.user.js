// ==UserScript==
// @name         AMQ Show Original Name
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Makes you able to see the original names of players
// @author       Zolhungaj
// @match        https://animemusicquiz.com/*
// @grant        none
// @downloadURL  https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqShowOriginalName.user.js
// @updateURL    https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqShowOriginalName.user.js
// @require      https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqGetOriginalNameUtility.user.js
// @copyright    MIT license
// ==/UserScript==

let enableOriginalName = true

let alwaysShowOriginalName = false

const generateNameString = (nickName, originalName, hasNewLine=false) => {
    //console.log(nickName, originalName)
    //hasNewLine = false
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
        spectator.originalName = await getOriginalName(spectator.name)
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
        const originalName = await getOriginalName(payload.spectatorDescription.name)
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
    getOriginalName(newPlayer.name).then(
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
    )
    return newPlayer
}

lobby._newPlayerListner = new Listener(
    "New Player",
    async function (player) {
        const that = lobby
        player.originalName = await getOriginalName(player.name)
        const newPlayer = that.addPlayer(player)
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
        player.originalName = await getOriginalName(player.name)
        const newPlayer = that.addPlayer(player)
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
quiz.setupQuiz = function(players, isSpectator, quizState, settings, isHost, groupSlotMap, soloMode, teamAnswers, selfAnswer){
    const that = quiz
    that.oldSetupQuiz(players, isSpectator, quizState, settings, isHost, groupSlotMap, soloMode, teamAnswers, selfAnswer)
    players.forEach((player) => {
        const thePlayer = this.players[player.gamePlayerId]
        getOriginalName(thePlayer.name).then(
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
        )
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
        spectator.originalName = getOriginalName(name).then(adjustName)
    }else{
        adjustName(spectator.originalName)
    }
}

GameChat.prototype.oldAddPlayerToQueue = GameChat.prototype.addPlayerToQueue
GameChat.prototype.addPlayerToQueue = function (name) {
    this.oldAddPlayerToQueue(name) 
    getOriginalName(name).then(
        (originalName) => {
            this.queueMap[name].find("h3").text(generateNameString(name, originalName))
        })
}