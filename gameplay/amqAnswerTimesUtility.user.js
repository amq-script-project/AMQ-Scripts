// ==UserScript==
// @name         AMQ Player Answer Times Utility
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Stores time spent answering per player
// @author       Zolhungaj
// @match        https://animemusicquiz.com/*
// @grant        none
// @downloadURL  https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqAnswerTimesUtility.user.js
// @updateURL    https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqAnswerTimesUtility.user.js
// @copyright    MIT license
// ==/UserScript==

const amqAnswerTimesUtility = {
    songStartTime: 0,
    playerTimes: []
}
new Listener("play next song", () => {
    amqAnswerTimesUtility.songStartTime = Date.now()
    amqAnswerTimesUtility.playerTimes = []
}).bindListener()

new Listener("player answered", (data) => {
    const time = Date.now() - amqAnswerTimesUtility.songStartTime
    data.forEach(gamePlayerId => {
        amqAnswerTimesUtility.playerTimes[gamePlayerId] = time
    })
}).bindListener()

new Listener("Join Game", (data) => {
    const quizState = data.quizState;
    if(quizState){
        amqAnswerTimesUtility.songStartTime = Date.now() - quizState.songTimer * 1000
    }
}).bindListener()