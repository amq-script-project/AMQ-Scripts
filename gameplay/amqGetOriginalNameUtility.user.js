// ==UserScript==
// @name         AMQ Get Original Name Utility
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Provides functions for getting the original name of players
// @author       Zolhungaj
// @match        https://animemusicquiz.com/*
// @grant        none
// @downloadURL  https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqGetOriginalNameUtility.user.js
// @updateURL    https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqGetOriginalNameUtility.user.js
// @copyright    MIT license
// ==/UserScript==

const nameToOriginalNameMap = {}

let profileLock = 0
const lockoutTime = 1000

const getOriginalName = async (name) => {
    if(nameToOriginalNameMap[name]){
        return nameToOriginalNameMap[name]
    }else{
        const now = new Date().getTime()
        if(now < profileLock){
            profileLock = Math.max(profileLock + lockoutTime, now + lockoutTime) //adds additional time for next to wait, cumulative but always at least lockoutTime seconds
            await wait(profileLock - lockoutTime - now)
        }else{
            profileLock = now + lockoutTime
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
}).bindListener()

new Listener("spectator name change", ({oldName, newName}) => {
    updateName(oldName,newName)
}).bindListener()

new Listener("friend name change", ({oldName, newName}) => {
    updateName(oldName,newName)
}).bindListener()

new Listener("all player name change", ({oldName, newName}) => {
    updateName(oldName,newName)
}).bindListener()

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