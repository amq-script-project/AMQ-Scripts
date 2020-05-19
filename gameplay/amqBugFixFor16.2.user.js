// ==UserScript==
// @name         bugfix on 0.16.2
// @namespace    http://tampermonkey.net/
// @version      1.0
// @downloadURL  https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqBugFixFor16.2.user.js
// @updateURL    https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqBugFixFor16.2.user.js
// @description  Fixes opening new profiles after gaccha update
// @author       Zolhungaj
// @match        https://animemusicquiz.com/*
// @grant        none
// @copyright    MIT License
// ==/UserScript==

playerProfileController.displayProfile2 = playerProfileController.displayProfile

playerProfileController.displayProfile = (payload, offset, closeHandler, offline, inGame) => {
    if(!payload.profileEmoteId){
        payload.avatarProfileImage = true
    }
    playerProfileController.displayProfile2(payload, offset, closeHandler, offline, inGame);
}
