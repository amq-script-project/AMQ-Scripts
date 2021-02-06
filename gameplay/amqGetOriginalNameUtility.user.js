// ==UserScript==
// @name         AMQ Get Original Name Utility
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Provides functions for getting the original name of players
// @author       Zolhungaj
// @match        https://animemusicquiz.com/*
// @grant        none
// @downloadURL  https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqGetOriginalNameUtility.user.js
// @updateURL    https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqGetOriginalNameUtility.user.js
// @copyright    MIT license
// ==/UserScript==

const amqGetOriginalNameUtility = new function(){
    "use strict"
    this._nameToOriginalNameMap = {}
    this._profileLock = 0
    this._lockoutTime = 1000
    this._timeout = 10000
    this.getOriginalName = () => Promise.reject("getOriginalName was unable to be defined")
    this._wait = (timeMs) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => { resolve() }, timeMs)
        })
    }
    this._updateName = async (oldName, newName) => {
        delete this._nameToOriginalNameMap[oldName]
        await this.getOriginalName(newName) //to ensure integrity
    }

    if(typeof(Listener) === "undefined" || typeof(socket) === "undefined"){
        return
    }
    this.getOriginalName = async (name) => {
        if(this._nameToOriginalNameMap[name]){
            return this._nameToOriginalNameMap[name]
        }else{
            const now = Date.now()
            if(now < this._profileLock){
                this._profileLock = Math.max(this._profileLock + this._lockoutTime, now + this._lockoutTime) //adds additional time for next to wait, cumulative but always at least lockoutTime seconds
                await this._wait(this._profileLock - this._lockoutTime - now)
            }else{
                this._profileLock = now + this._lockoutTime
            }
            return await new Promise((resolve, reject) => {
                let timeout
                const profileListener = new Listener("player profile", (payload) => {
                    if(payload.name !== name){
                        //in theory this shouldn't happen without incredibly slow internet or another more agressive script
                    }else{
                        this._nameToOriginalNameMap[payload.name] = payload.originalName
                        profileListener.unbindListener()
                        clearTimeout(timeout)
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
                timeout = setTimeout(() => {
                    profileListener.unbindListener()
                    reject(`getOriginalName: timeout for "${name}"`)
                }, this._timeout)
            })
        }
    }
    new Listener("player name change", ({oldName, newName}) => {
        this._updateName(oldName,newName)
    }).bindListener()
    
    new Listener("spectator name change", ({oldName, newName}) => {
        this._updateName(oldName,newName)
    }).bindListener()
    
    new Listener("friend name change", ({oldName, newName}) => {
        this._updateName(oldName,newName)
    }).bindListener()
    
    new Listener("all player name change", ({oldName, newName}) => {
        this._updateName(oldName,newName)
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
        this._nameToOriginalNameMap[payload.name] = payload.originalName
    
        console.log(payload)
    }).bindListener()
}()

const getOriginalName = amqGetOriginalNameUtility.getOriginalName