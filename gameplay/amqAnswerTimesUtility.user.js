// ==UserScript==
// @name         AMQ Player Answer Times Utility
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Stores time spent answering per player
// @author       Zolhungaj
// @match        https://animemusicquiz.com/*
// @grant        none
// @downloadURL  https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqAnswerTimesUtility.user.js
// @updateURL    https://github.com/amq-script-project/AMQ-Scripts/raw/master/gameplay/amqAnswerTimesUtility.user.js
// @copyright    MIT license
// ==/UserScript==

const amqAnswerTimesUtility = new function(){
    this.songStartTime = 0
    this.playerTimes = []
    if (typeof(Listener) === "undefined") {
        return
    }
    new Listener("play next song", () => {
        this.songStartTime = Date.now()
        this.playerTimes = []
    }).bindListener()
    
    new Listener("player answered", (data) => {
        const time = Date.now() - this.songStartTime
        data.forEach(gamePlayerId => {
            this.playerTimes[gamePlayerId] = time
        })
    }).bindListener()
    
    new Listener("Join Game", (data) => {
        const quizState = data.quizState;
        if(quizState){
            this.songStartTime = Date.now() - quizState.songTimer * 1000
        }
    }).bindListener()
}()