// ==UserScript==
// @name         AMQ Level Guard
// @version      1.1
// @description  Introduces ability to limit level of players
// @author       Zolhungaj
// @match        https://animemusicquiz.com/*
// @grant        none
// @require      https://github.com/joske2865/AMQ-Scripts/raw/master/common/amqScriptInfo.js
// @updateURL    https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqLevelGuard.user.js
// @downloadURL  https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqLevelGuard.user.js
// ==/UserScript==

// Wait until the LOADING... screen is hidden and load script
if (typeof Listener === "undefined") return;
let loadInterval = setInterval(() => {
    if ($("#loadingScreen").hasClass("hidden")) {
        clearInterval(loadInterval);
        setup();
    }
}, 500);

const version = "1.1"
let maxLevel = -1 // -1: disabled, 0: kick everyone who aren't guest, 1+: kick everyone above that level
let minLevel = 0 // 0: disabled, 1: kick guests, 2+: kick everyone below that level
let instaKick = false // false: move offending players to spectator, true: kick offending players AND spectators
const guestRegex = /^Guest-\d{5}$/
const userScriptName = "LevelGuard"
const grudges = {}
const grudgeLimit = 3
const command = "/levelguard"

function setup() {

    new Listener("Host Game", () => {
        reset()
    }).bindListener()

    new Listener("Spectate Game", () => {
        reset()
    }).bindListener()

    new Listener("Join Game", () => {
        reset()
    }).bindListener()

    new Listener("game chat update", ({messages}) => {
        messages.forEach(({sender, message}) => {
            if (sender === selfName && message.startsWith(command)) {
                parseCommand(message)
            }
        })
    }).bindListener()

    new Listener("New Player", ({name, level}) => {
        if(isOn()){
            judgePlayer(name, level)
        }
    }).bindListener()

    new Listener("Spectator Change To Player", ({name, level}) => {
        if(isOn()){
            judgePlayer(name, level)
        }
    }).bindListener()

    new Listener("New Spectator", ({name}) => {
        if(!lobby.isHost || !isOn()){
            return //ignore when not host or when disabled
        }
        judgeSpectator(name)
    }).bindListener()

    AMQ_addScriptData({
        name: "Level Guard",
        author: "Zolhungaj",
        version: version,
        link: "https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqLevelGuard.user.js",
        description: `
            <p>Adds level discrimination to AMQ, a feature to limit highest and lowest level, plus limit game to only guests or only registered players</p>
            <p>Usage:"/levelguard a b c" a and b are required, c is optional</p>
            <p>a is the lowest allowed level (1 to ban guests only), 0 to disable</p>
            <p>b is the highest allowed level, 0 to ban everything but guests, -1 to disable</p>
            <p>c is the instakick toggle, set to 1 to instantly kick offending players and spectators. 0(default) to only move player to spectator</p>
        `
    })
}

const reset = () => {
    maxLevel = -1
    minLevel = 0
    instaKick = false
}

const isOn = () => {
    return maxLevel !== -1 || minLevel !== 0
}

const parseCommand = (message) => {
    const args = message
        .split(/\s+/)
        .slice(1)
    if(args[0] === "off"){
        reset()
        printSuccessToChat(`${userScriptName} disabled`)
    }
    if(args.length < 2){
        printErrorToChat(`Error, 2 required arguments, got ${args.length}. Usage: ${command} [min level] [max level] &lt;instant kick&gt;`)
        return
    }
    const minLevelArg = Number.parseInt(args[0])
    const maxLevelArg = Number.parseInt(args[1])
    const instaKickArg = Boolean(args[2])

    if(isNaN(minLevelArg)){
        printErrorToChat("Error, minLevel must be a whole number")
    }else if(isNaN(maxLevelArg)){
        printErrorToChat("Error, maxLevel must be a whole number")
    }else if(minLevelArg < 0){
        printErrorToChat("Error, minLevel must be in the range [0,∞)")
    }else if(maxLevelArg < -1){
        printErrorToChat("Error, maxLevel must be in the range [-1,∞)")
    }else if(maxLevelArg === 0 && minLevelArg > 0){
        printErrorToChat("Error, no players can join with these settings")
    }else{
        minLevel = minLevelArg
        maxLevel = maxLevelArg
        instaKick = instaKickArg
        if(minLevel === 0 && maxLevel === -1){
            printSuccessToChat(`${userScriptName} disabled`)
        }else{
            let successMessage = `${userScriptName} activated:`
            if(minLevel > 0){
                successMessage += " guests disabled,"
                if(minLevel > 1){
                    successMessage += ` minimum level:${minLevel},`
                }
            }
            if(maxLevel === 0){
                successMessage += ` registered users disabled,`
            }else if(maxLevel > 0){
                successMessage += ` maximum level:${maxLevel},`
            }
            successMessage += " offenders are " + (instaKick ? "kicked!" : "moved to spectator.")

            printSuccessToChat(successMessage)
            activate()
        }
    }
}

const printErrorToChat = (message) => {
    printToChat(`<b style="color:red">${message}</b>`)
}
const printSuccessToChat = (message) => {
    printToChat(`<b style="color:dodgerblue">${message}</b>`)
}

const printToChat = (message) => {
    gameChat.systemMessage(message)
}

const activate = () => {
    Object.keys(lobby.players)
        .map(num => lobby.players[num])
        .forEach(({_name, level}) => judgePlayer(_name, level))

    gameChat.spectators.forEach(({name}) => judgeSpectator(name))
}

const judgeSpectator = (playerName) => {
    if(!instaKick || playerName === selfName){
        return // do not react to spectators unless they can be kicked, ignore self for practical reasons
    }
    const profileListener = new Listener("player profile", ({name, level}) => {
        if(playerName === name){
            if(!isAllowedLevel(level)){
                kick(playerName)
            }
            profileListener.unbindListener()
        }
    })
    profileListener.bindListener()
    socket.sendCommand({
        type: 'social',
        command: 'player profile',
        data: {
            name: playerName
        }
    })
}

const judgePlayer = (playerName, level) => {
    if(!isAllowedLevel(level)){
        if(playerName === selfName){
            lobby.changeToSpectator(playerName)
            printErrorToChat("You are outside the set limits and thus not allowed to play :)")
        }else if(instaKick){
            kick(playerName)
        }else{
            grudges[playerName] = (grudges[playerName] ?? 0) + 1
            if(grudges[playerName] > grudgeLimit){
                kick(playerName)
            }else{
                lobby.changeToSpectator(playerName)
            }
        }
    }
}


const kick = (playerName) => {
    socket.sendCommand({
        type: 'lobby',
        command: 'kick player',
        data: {
            playerName: playerName
        }
    })
}

function isAllowedLevel(level, username) {
    if(maxLevel !== -1){
        if(maxLevel === 0){
            if(!guestRegex.test(username)){
                return false
            }
        }else{
            if(level > maxLevel){
                return false
            }
        }
    }

    if(minLevel !== 0){
        if(minLevel === 1){
            if(guestRegex.test(username)){
                return false
            }
        }else{
            if(level < minLevel){
                return false
            }
        }
    }
    return true
}
