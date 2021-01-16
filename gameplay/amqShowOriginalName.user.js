// ==UserScript==
// @name         AMQ Show Original Name
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  makes you able to see the original names of players
// @author       Zolhungaj
// @match        https://animemusicquiz.com/*
// @grant        none
// @downloadURL  https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqShowOriginalName.user.js
// @updateURL    https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqShowOriginalName.user.js
// @copyright    MIT license
// ==/UserScript==


const nameToOriginalNameMap = {}

let lastCheck = 0
const checkTimeOut = 1000


const getOriginalName = async (name) => {
    if(nameToOriginalNameMap[name]){
        return nameToOriginalNameMap[name]
    }else{
        const now = new Date().getTime()
        if(now < lastCheck + checkTimeOut){
            await wait(lastCheck + checkTimeOut - now)
        }
        return await new Promise((resolve, reject) => {
            const profileListener = new Listener("player profile", (payload) => {
                if(payload.name !== name){
                    //in theory this shouldn't happen without incredibly slow internet or another more agressive script
                }else{
                    nameToOriginalNameMap[payload.name] = payload.originalName
                    profileListener.unbindListener()
                    resolve(payload.originalName)
                }
            })
            profileListener.bindListener()
            socket.sendCommand({
                type: 'social',
                command: 'player profile',
                data: {
                    name: name
                }
            });
        })
    }
}

const wait = (timeMs) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => { resolve() }, timeMs)
    })
}

const updateName = async (oldName, newName) => {
    originalName = await getOriginalName(newName) //in case this player was never scanned before
    delete nameToOriginalNameMap[oldName]
    nameToOriginalNameMap[newName] = originalName // this should have been set by getOriginalName, but who knows
}

new Listener("player name change", ({oldName, newName}) => {
    updateName(oldName,newName)
})

new Listener("spectator name change", ({oldName, newName}) => {
    updateName(oldName,newName)
})

new Listener("friend name change", ({oldName, newName}) => {
    updateName(oldName,newName)
})

new Listener("all player name change", ({oldName, newName}) => {
    updateName(oldName,newName)
})


gameChat._newSpectatorListner = new Listener(
    "New Spectator",
    async function (spectator) {
        spectator.originalName = await getOriginalName(spectator.name)
        const that = gameChat
        that.addSpectator(spectator)
        if (that.displayJoinLeaveMessages) {
            if(spectator.name === spectator.originalName){
                that.systemMessage(spectator.name + " has started spectating.", "")
            }else{
                that.systemMessage(spectator.name + "(" + spectator.originalName + ")" + " has started spectating.", "")
            }
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
            if(playerName === originalName){
                that.systemMessage(playerName + " changed to spectator", "")
            }else{
                that.systemMessage(playerName + "(" + originalName + ")" + " changed to spectator", "")
            }
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
                    that.$NAME_CONTAINER.text(newName + "(" + that.originalName + ")")
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
            if(newPlayer.name === newPlayer.originalName){
                gameChat.systemMessage(newPlayer.name + " joined the room.", "")
            }else{
                gameChat.systemMessage(newPlayer.name + "(" + newPlayer.originalName + ")" + " joined the room.", "")
            }
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
            if(newPlayer.name === newPlayer.originalName){
                gameChat.systemMessage(newPlayer.name + " changed to player.", "")
            }else{
                gameChat.systemMessage(newPlayer.name + "(" + newPlayer.originalName + ")" + " changed to player.", "")
            }
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
                        that._name = newName;
                        that.avatarSlot.name = newName + "(" + that.originalName + ")";
                        that.avatarSlot.updateSize(that.avatarSlot.currentMaxWidth, that.avatarSlot.currentMaxHeight);
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
        nameField.find("span").text(name + "(" + originalName + ")")

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
            this.queueMap[name].find("h3").text(name + "(" + originalName + ")")
        })
}

new Listener("player profile", (payload) => {
    //this just passively collects names in case the user has another userscript doing this stuff, to lessen the load on the server

    //allBadges, empty array unless own profile
    //avatar.
    //       avatarName
    //       colorName
    //       optionActive
    //       optionName
    //       outfitName
    //avatarProfileImage //1 or null
    //badges[
    //       fileName
    //       id
    //       name
    //       slot
    //       special
    //       type
    //       unlockDescription
    //creationDate.
    //             adminView : boolean
    //             hidden : boolean
    //             value : string/null
    //guessPercent.
    //             hidden : boolean
    //             value : number/null
    //level : int
    //name : string
    //originalName : string
    //profileEmoteId : int/null
    //songCount.
    //          hidden : boolean
    //          value : int/null
    nameToOriginalNameMap[payload.name] = payload.originalName

    console.log(payload)
}).bindListener()