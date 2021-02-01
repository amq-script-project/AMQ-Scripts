// ==UserScript==
// @name         AMQ Avatar Count
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Shows your avatar count in the avatar screen
// @author       Zolhungaj
// @match        https://animemusicquiz.com/*
// @grant        none
// @downloadURL  https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqAvatarCount.user.js
// @updateURL    https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqAvatarCount.user.js
// @copyright    MIT license
// ==/UserScript==


const injectNumbers = () => {
    const total = storeWindow.topBar.characters.reduce((acc, val) => acc + val.avatars.reduce((acc, val) => acc + val.colors.length, 0), 0)
    const current = Object.values(storeWindow.avatarUnlockCount).reduce((acc, val) => acc+ val,0)
    $("#swNoSelectionContainer").find("h2").html(`Nothing Selected <br /> Select Above<br /> ${current}/${total} unlocked`)
}
let isFirst = true

storeWindow.toggleOld = storeWindow.toggle
storeWindow.toggle = function(){
    storeWindow.toggleOld()
    injectNumbers()
    if(isFirst){
        isFirst = false
        storeWindow.avatarColumn.newUnlockOld = storeWindow.avatarColumn.newUnlock
        storeWindow.avatarColumn.newUnlock = function(){
            storeWindow.avatarColumn.newUnlockOld()
            injectNumbers()
        }
    }
}

